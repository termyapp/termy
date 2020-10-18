#[macro_use]
extern crate napi;
#[macro_use]
extern crate napi_derive;

use napi::{CallContext, JsObject, JsString, Module, NapiValue};
use std::convert::TryInto;
use suggestions::get_suggestions;
mod suggestions;

register_module!(shell, init);

fn init(module: &mut Module) -> napi::Result<()> {
    module.create_named_method("getSuggestions", suggestions)?;

    Ok(())
}

#[js_function(2)]
fn suggestions(ctx: CallContext) -> napi::Result<JsObject> {
    let input: String = ctx.get::<JsString>(0)?.try_into()?;
    let current_dir: String = ctx.get::<JsString>(1)?.try_into()?;
    // let task = AsyncTask(argument);
    // ctx.env.spawn(task)

    let suggestions = get_suggestions(input, current_dir).unwrap();
    // println!("{}", suggestions.len());
    let mut result = ctx.env.create_array_with_length(suggestions.len())?;
    for (index, suggestion) in suggestions.iter().enumerate() {
        if index > 10 {
            // limit suggestions to a maximum of 10
            break;
        }

        let mut data = ctx.env.create_object()?;

        let name = ctx.env.create_string(&suggestion.name)?;
        let command = ctx.env.create_string(&suggestion.command)?;
        let score = ctx.env.create_int64(suggestion.score)?;

        data.set_named_property("name", name)?;
        data.set_named_property("command", command)?;
        data.set_named_property("score", score)?;

        result.set_element(index as u32, data)?;
    }

    Ok(result)
}

// extern crate base64;

// use base64::encode;
// use cmd::{PromptStruct, ViewStruct};
// use fs::File;
// use io::Read;
// use serde::{Deserialize, Serialize};
// use shell::shell;
// use std::{
//     collections::HashMap,
//     ffi::OsStr,
//     fs,
//     io::{self},
//     path::Path,
// };
// use std::{process::Command, thread};
// mod cmd;! marton#9930
// mod shell;
// use crossbeam_channel::unbounded;

// #[derive(Deserialize)]
// #[serde(tag = "cmd", rename_all = "camelCase")]
// pub enum Cmd {
//     ViewCommand(ViewStruct),
//     Prompt(PromptStruct),
// }

// #[derive(Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct ViewStruct {
//     pub path: String,
//     pub callback: String,
//     pub error: String,
// }

// #[derive(Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct PromptStruct {
//     pub input: String,
//     pub current_dir: String,
//     pub callback: String,
//     pub error: String,
// }

// #[derive(Serialize, Deserialize, Debug)]
// #[serde(rename_all = "camelCase")]
// struct Event {
//     id: String,
//     event_type: String,
//     input: String,
//     current_dir: String,
// }

// .setup(|_webview, _source| {
//     let webview = _webview.as_mut();
//     let mut senders = HashMap::new();
//     println!("Senders len: {}", senders.len());

//     tauri::event::listen(String::from("event"), move |arg| {
//         let event = arg.unwrap();
//         let event: Event = serde_json::from_str(&event).unwrap();
//         println!("Event: {:?}", event);

//         let mut webview2 = webview.clone();

//         match event.event_type.as_ref() {
//             "NEW_COMMAND" => {
//                 let (sender, receiver) = unbounded();
//                 senders.insert(event.id.to_owned(), sender);

//                 // let id = event.id.clone();
//                 // let mut remove_sender = || {
//                 //     senders.remove(&id);
//                 // };
//                 thread::spawn(move || {
//                     if let Err(err) = shell(
//                         &mut webview2,
//                         receiver,
//                         event.id,
//                         event.input,
//                         event.current_dir,
//                     ) {
//                         println!("Error in shell: {}", err);
//                     }

//                     // todo: clean up
//                     // remove_sender();
//                 });

//                 println!("Success!");
//             }
//             "STDIN" => {
//                 if let Some(s) = senders.get(&event.id) {
//                     let copy = event.input.clone();
//                     // communicate to correct thread
//                     if let Err(err) = s.send(event.input) {
//                         println!("Error sending message: {}", err);
//                     } else {
//                         println!("Message sent: {}", copy);
//                     }
//                 }
//             }
//             _ => {
//                 println!("Invalid event type: {}", event.event_type);
//             }
//         }
//     });

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
