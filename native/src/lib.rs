#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use crossbeam_channel::{unbounded, Sender};
use napi::{
    CallContext, Error, JsBuffer, JsExternal, JsFunction, JsNumber, JsObject, JsString,
    JsUndefined, Module,
};
use shell::{Cell, CellType};
use std::thread;

mod db;
mod shell;
mod suggestions;

register_module!(module, init); // only calling it so rust-analyzer thinks it gets called

fn init(module: &mut Module) -> napi::Result<()> {
    module.create_named_method("api", api)?;

    module.create_named_method("getSuggestions", get_suggestions)?;

    module.create_named_method("runCell", run_cell)?;

    module.create_named_method("sendStdin", send_stdin)?;

    db::init().expect("Failed to initialize database");

    Ok(())
}

#[js_function(1)]
fn api(ctx: CallContext) -> napi::Result<JsString> {
    let command: String = ctx.get::<JsString>(0)?.into_utf8()?.to_owned()?;

    let result = Cell::api(command);

    ctx.env.create_string(&result)
}

#[js_function(2)]
fn get_suggestions(ctx: CallContext) -> napi::Result<JsObject> {
    let input = ctx.get::<JsString>(0)?.into_utf8()?.to_owned()?;
    let current_dir: String = ctx.get::<JsString>(1)?.into_utf8()?.to_owned()?;

    let suggestions = suggestions::get_suggestions(input, current_dir).unwrap();
    // limit suggestions to a maximum of 10
    let length = if suggestions.len() > 10 {
        10
    } else {
        suggestions.len()
    };

    let mut result = ctx.env.create_array_with_length(10)?;
    for index in 0..length {
        let suggestion = suggestions.get(index).unwrap();
        let mut data = ctx.env.create_object()?;

        let command = ctx.env.create_string(&suggestion.command)?;
        let score = ctx.env.create_int64(suggestion.score)?;

        data.set_named_property("command", command)?;
        data.set_named_property("score", score)?;

        result.set_element(index as u32, data)?;
    }

    Ok(result)
}

#[js_function(5)]
fn run_cell(ctx: CallContext) -> napi::Result<JsExternal> {
    let id: String = ctx.get::<JsString>(0)?.into_utf8()?.to_owned()?;
    let input: String = ctx.get::<JsString>(1)?.into_utf8()?.to_owned()?;
    let current_dir: String = ctx.get::<JsString>(2)?.into_utf8()?.to_owned()?;
    let send_output = ctx.get::<JsFunction>(3)?;
    let send_status = ctx.get::<JsFunction>(4)?;

    let (sender, receiver) = unbounded::<String>();
    let shell_sender = sender.clone();

    let send_output = ctx.env.create_threadsafe_function(
        send_output,
        0,
        |ctx: napi::threadsafe_function::ThreadSafeCallContext<Vec<String>>| {
            ctx.value
                .iter()
                .map(|arg| ctx.env.create_string(arg))
                .collect::<Result<Vec<JsString>, Error>>()
        },
    )?;

    let send_status = ctx.env.create_threadsafe_function(
        send_status,
        0,
        |ctx: napi::threadsafe_function::ThreadSafeCallContext<Vec<u32>>| {
            ctx.value
                .iter()
                .map(|arg| ctx.env.create_uint32(*arg as u32))
                .collect::<Result<Vec<JsNumber>, Error>>()
        },
    )?;

    thread::spawn(move || {
        db::add_command(&input, &current_dir).expect("Failed to add command");

        let cell = Cell::new(id, current_dir, input);
        let cell_type = cell.get_type();
        let mut status = match cell_type {
            CellType::PTY => vec![0],
            CellType::API => vec![1],
        };

        // send start status
        send_status.call(
            Ok(status.clone()),
            napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
        );
        // run cell
        match cell.run(send_output, receiver, shell_sender) {
            Ok(true) => {
                println!("Exit status: 0");
                status.push(0);
            }
            Ok(false) => {
                println!("Exit status: 1");
                status.push(1);
            }
            Err(err) => {
                println!("Error in shell: {}", err);
                status.push(1);
            }
        }

        // send exit status
        send_status.call(
            Ok(status),
            napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
        );

        send_status.release(napi::threadsafe_function::ThreadsafeFunctionReleaseMode::Release);
    });

    ctx.env.create_external(sender)
}

#[js_function(2)]
fn send_stdin(ctx: CallContext) -> napi::Result<JsUndefined> {
    let attached_obj = ctx.get::<JsExternal>(0)?;
    let sender = ctx
        .env
        .get_value_external::<Sender<String>>(&attached_obj)?;

    let key: String = ctx.get::<JsString>(1)?.into_utf8()?.to_owned()?;

    if let Err(err) = sender.send(key) {
        println!("Failed to send key: {}", err);
    }

    ctx.env.get_undefined()
}

// todo: replace below code w/ api
//
// #[derive(Serialize, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct DirContent {
//     path: String,
//     file_name: String,
//     is_dir: bool,
//     is_file: bool,
// }

// #[derive(Serialize, Debug)]
// #[serde(rename_all = "camelCase")]
// enum ViewType {
//     Dir,
//     Img,
//     Text,
//     Else,
// }

// #[derive(Serialize, Debug)]
// #[serde(rename_all = "camelCase")]
// pub struct ViewCommand {
//     path: String,
//     view_type: ViewType,
//     // metadata
//     content: String, // Parsed json
// }

// fn view_command(path: String) -> Result<ViewCommand> {
//     println!("Path: {}", path);
//     let ospath = OsStr::new(&path);
//     let metadata = fs::metadata(ospath)?;

//     // might break on windows
//     let extension = Path::new(&path).extension();

//     let mut view_type = if metadata.is_dir() {
//         ViewType::Dir
//     } else if let Some(extension) = extension {
//         if ["png", "jpg"].contains(&extension.to_str().unwrap()) {
//             ViewType::Img
//         } else {
//             ViewType::Text
//         }
//     } else {
//         ViewType::Text
//     };

//     let content = match view_type {
//         ViewType::Dir => {
//             let entries = fs::read_dir(&path)?
//                 .map(|res| {
//                     res.map(|e| DirContent {
//                         path: e.path().to_str().unwrap().to_string(),
//                         is_dir: e.metadata().unwrap().is_dir(),
//                         file_name: e.file_name().to_str().unwrap().to_string(),
//                         is_file: e.file_type().unwrap().is_file(),
//                     })
//                 })
//                 .collect::<Result<Vec<_>, io::Error>>()?;

//             serde_json::to_string(&entries)?
//         }
//         ViewType::Img => {
//             let mut file = File::open(&path).unwrap();
//             let mut vec = Vec::new();
//             let _ = file.read_to_end(&mut vec);
//             let base64 = encode(vec);
//             format!(
//                 "data:image/{};base64,{}",
//                 extension.unwrap().to_str().unwrap(),
//                 base64
//             )
//         }
//         ViewType::Text => {
//             if let Ok(text) = fs::read_to_string(&path) {
//                 text
//             } else {
//                 view_type = ViewType::Else;
//                 "".to_string()
//             }
//         }
//         _ => "".to_string(),
//     };

//     Ok(ViewCommand {
//         path,
//         view_type,
//         content,
//     })
// }
