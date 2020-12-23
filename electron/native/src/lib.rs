#[macro_use]
extern crate napi_derive;

use autocomplete::Autocomplete;
use cell::{Cell, CellChannel, FrontendMessage, RunCell, ServerMessage};
use crossbeam_channel::{unbounded, Sender};
use log::info;
use napi::{
    CallContext, Error, JsExternal, JsFunction, JsObject, JsString, JsUndefined, JsUnknown, Module,
    Result, Status,
};
use std::thread;
mod autocomplete;
mod cell;
mod commands;
mod db;
mod logger;
mod util;

#[module_exports]
fn init(mut exports: JsObject) -> Result<()> {
    exports.create_named_method("api", api)?;

    exports.create_named_method("getSuggestions", get_suggestions)?;

    exports.create_named_method("runCell", run_cell)?;

    exports.create_named_method("frontendMessage", frontend_message)?;

    // todo: this fails in prod
    // db::init().expect("Failed to initialize database");

    logger::init().unwrap();

    Ok(())
}

#[js_function(1)]
fn api(ctx: CallContext) -> napi::Result<JsString> {
    let command: String = ctx.get::<JsString>(0)?.into_utf8()?.into_owned()?;

    info!("Api call: {}", command);

    // let result = Cell::api(command);

    // ctx.env.create_string(&result)

    todo!()
}

#[js_function(2)]
fn get_suggestions(ctx: CallContext) -> napi::Result<JsUnknown> {
    let input = ctx.get::<JsString>(0)?.into_utf8()?.into_owned()?;
    let current_dir: String = ctx.get::<JsString>(1)?.into_utf8()?.into_owned()?;

    info!("Getting suggestions for {}", input);

    let suggestions = Autocomplete::new(input, current_dir).suggestions();

    // needs "serde-json" feature
    ctx.env.to_js_value(&suggestions)
}

#[js_function(5)]
fn run_cell(ctx: CallContext) -> napi::Result<JsExternal> {
    let props: RunCell = ctx.env.from_js_value(ctx.get::<JsUnknown>(0)?)?;
    let server_message = ctx.get::<JsFunction>(1)?;

    let (sender, receiver) = unbounded::<CellChannel>();
    let shell_sender = sender.clone();

    let server_message = ctx.env.create_threadsafe_function(
        &server_message,
        0,
        |ctx: napi::threadsafe_function::ThreadSafeCallContext<Vec<ServerMessage>>| {
            ctx.value
                .iter()
                .map(|arg| ctx.env.to_js_value(&arg))
                .collect::<Result<Vec<JsUnknown>>>()
        },
    )?;

    info!("Executing command: {:?}", props);

    thread::spawn(move || {
        // db::add_command(&input, &current_dir).expect("Failed to add command");

        let cell = Cell::new(props);

        // run cell
        // todo: when refactoring handle error returned from here (send 'error' status)
        cell.run(server_message, receiver, shell_sender)
            .expect("Error while running cell");
    });

    ctx.env.create_external(sender)
}

#[js_function(2)]
fn frontend_message(ctx: CallContext) -> napi::Result<JsUndefined> {
    let attached_obj = ctx.get::<JsExternal>(0)?;
    let sender = ctx
        .env
        .get_value_external::<Sender<CellChannel>>(&attached_obj)?;

    let message: FrontendMessage = ctx.env.from_js_value(ctx.get::<JsUnknown>(1)?)?;

    info!("Frontend message: {:?}", message);

    if let Err(err) = sender.send(CellChannel::FrontendMessage(message)) {
        info!("Failed to send key: {}", err);
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
//     info!("Path: {}", path);
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
