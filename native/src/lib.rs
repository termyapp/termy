#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use napi::{CallContext, JsFunction, JsObject, JsString, JsUndefined, Module};

use std::convert::TryInto;
use suggestions::get_suggestions;
mod suggestions;

extern crate base64;

use base64::encode;
use fs::File;
use io::Read;
use serde::{Deserialize, Serialize};
use shell::shell;
use std::{
    collections::HashMap,
    ffi::OsStr,
    fs,
    io::{self},
    path::Path,
};
use std::{process::Command, thread};

mod shell;
use crossbeam_channel::unbounded;

register_module!(shell, init);

fn init(module: &mut Module) -> napi::Result<()> {
    module.create_named_method("getSuggestions", suggestions)?;

    module.create_named_method("newCommand", command)?;

    Ok(())
}

#[js_function(2)]
fn suggestions(ctx: CallContext) -> napi::Result<JsObject> {
    let input: String = ctx.get::<JsString>(0)?.try_into()?;
    let current_dir: String = ctx.get::<JsString>(1)?.try_into()?;

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
struct Event {
    id: String,
    event_type: String,
    input: String,
    current_dir: String,
}

#[js_function(4)]
fn command(ctx: CallContext) -> napi::Result<JsUndefined> {
    //   let arg0 = ctx.get::<JsUnknown>(0)?;
    //   let de_serialized: AnObject = ctx.env.from_js_value(arg0)?;

    let id: String = ctx.get::<JsString>(0)?.try_into()?;
    let input: String = ctx.get::<JsString>(1)?.try_into()?;
    let current_dir: String = ctx.get::<JsString>(2)?.try_into()?;
    let send_stdout = ctx.get::<JsFunction>(0)?;

    let send_stdout = ctx.env.create_threadsafe_function(send_stdout, 0, |ctx| {
        ctx.value
            .iter()
            .map(|v| ctx.env.create_uint32(*v))
            .collect::<Result<Vec<JsNumber>>>()
    })?;

    let mut senders = HashMap::new();
    let (sender, receiver) = unbounded();
    senders.insert(id.clone(), sender);
    println!("Senders len: {}", senders.len());

    thread::spawn(move || {
        if let Err(err) = shell(receiver, id, input, current_dir, send_stdout) {
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
