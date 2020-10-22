#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use napi::{CallContext, Error, JsFunction, JsNumber, JsObject, JsString, JsUndefined, Module};

use suggestions::get_suggestions;
mod suggestions;

extern crate base64;

use serde::{Deserialize, Serialize};
use shell::shell;
use std::thread;

mod shell;

register_module!(shell, init);

fn init(module: &mut Module) -> napi::Result<()> {
    module.create_named_method("getSuggestions", suggestions)?;

    module.create_named_method("newCommand", command)?;

    Ok(())
}

#[js_function(2)]
fn suggestions(ctx: CallContext) -> napi::Result<JsObject> {
    let input = ctx.get::<JsString>(0)?.into_utf8()?.to_owned()?;
    let current_dir: String = ctx.get::<JsString>(1)?.into_utf8()?.to_owned()?;

    let suggestions = get_suggestions(input, current_dir).unwrap();
    // limit suggestions to a maximum of 10
    let length = if suggestions.len() > 10 {
        10
    } else {
        suggestions.len()
    };

    let mut result = ctx.env.create_array_with_length(length)?;
    for index in 0..length {
        let suggestion = suggestions.get(index).unwrap();
        let mut data = ctx.env.create_object()?;

        let name = ctx.env.create_string(&suggestion.name)?;
        let command = ctx.env.create_string(&suggestion.command)?;
        let score = ctx.env.create_int64(suggestion.score)?;
        // ctx.env.to_js_value(&value)

        data.set_named_property("name", name)?;
        data.set_named_property("command", command)?;
        data.set_named_property("score", score)?;

        result.set_element(index as u32, data)?;
    }

    Ok(result)
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct NewCommand {
    id: String,
    input: String,
    current_dir: String,
}

#[js_function(4)]
fn command(ctx: CallContext) -> napi::Result<JsUndefined> {
    let id: String = ctx.get::<JsString>(0)?.into_utf8()?.to_owned()?;
    let input: String = ctx.get::<JsString>(1)?.into_utf8()?.to_owned()?;
    let current_dir: String = ctx.get::<JsString>(2)?.into_utf8()?.to_owned()?;
    let send_chunk = ctx.get::<JsFunction>(3)?;

    // let mut senders = HashMap::new();
    // let (sender, receiver) = unbounded();
    // senders.insert(id.clone(), sender);
    // println!("Senders len: {}", senders.len());

    let send_chunk = ctx.env.create_threadsafe_function(
        send_chunk,
        0,
        |ctx: napi::threadsafe_function::ThreadSafeCallContext<Vec<u8>>| {
            ctx.value
                .iter()
                .map(|arg| ctx.env.create_uint32(*arg as u32))
                .collect::<Result<Vec<JsNumber>, Error>>()
        },
    )?;

    thread::spawn(move || {
        if let Err(err) = shell(id, input, current_dir, send_chunk) {
            println!("Error in shell: {}", err);
        }
    });

    println!("Success!");

    ctx.env.get_undefined()
}

// let event = arg.unwrap();
// let event: Event = serde_json::from_str(&event).unwrap();
// println!("Event: {:?}", event);
// let id = event.id.clone();
// let mut remove_sender = || {
//     senders.remove(&id);
// };
// remove_sender();

// "STDIN" => {
//     if let Some(s) = senders.get(&event.id) {
//         let copy = event.input.clone();
//         // communicate to correct thread
//         if let Err(err) = s.send(event.input) {
//             println!("Error sending message: {}", err);
//         } else {
//             println!("Message sent: {}", copy);
//         }
//     }
// }

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
