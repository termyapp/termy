#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate base64;

use anyhow::Result;
use base64::encode;
use cmd::{PromptStruct, ViewStruct};
use fs::File;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
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
mod cmd;
mod shell;
use crossbeam_channel::unbounded;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Event {
    id: String,
    event_type: String,
    input: String,
    current_dir: String,
}

fn main() {
    tauri::AppBuilder::new()
        .setup(|_webview, _source| {
            let webview = _webview.as_mut();
            let mut senders = HashMap::new();
            println!("Senders len: {}", senders.len());

            tauri::event::listen(String::from("event"), move |arg| {
                let event = arg.unwrap();
                let event: Event = serde_json::from_str(&event).unwrap();
                println!("Event: {:?}", event);

                let mut webview2 = webview.clone();

                match event.event_type.as_ref() {
                    "NEW_COMMAND" => {
                        let (sender, receiver) = unbounded();
                        senders.insert(event.id.to_owned(), sender);

                        // let id = event.id.clone();
                        // let mut remove_sender = || {
                        //     senders.remove(&id);
                        // };
                        thread::spawn(move || {
                            if let Err(err) = shell(
                                &mut webview2,
                                receiver,
                                event.id,
                                event.input,
                                event.current_dir,
                            ) {
                                println!("Error in shell: {}", err);
                            }

                            // todo: clean up
                            // remove_sender();
                        });

                        println!("Success!");
                    }
                    "STDIN" => {
                        if let Some(s) = senders.get(&event.id) {
                            let copy = event.input.clone();
                            // communicate to correct thread
                            if let Err(err) = s.send(event.input) {
                                println!("Error sending message: {}", err);
                            } else {
                                println!("Message sent: {}", copy);
                            }
                        }
                    }
                    _ => {
                        println!("Invalid event type: {}", event.event_type);
                    }
                }
            });
        })
        .invoke_handler(|_webview, arg| {
            use cmd::Cmd::*;
            match serde_json::from_str(arg) {
                Err(e) => Err(e.to_string()),
                Ok(command) => {
                    match command {
                        ViewCommand(ViewStruct {
                            path,
                            callback,
                            error,
                        }) => tauri::execute_promise(
                            _webview,
                            move || {
                                let result = view_command(path)?;
                                // println!("Result: {:?}", result);
                                Ok(result)
                            },
                            callback,
                            error,
                        ),
                        Prompt(PromptStruct {
                            input,
                            current_dir,
                            callback,
                            error,
                        }) => tauri::execute_promise(
                            _webview,
                            move || {
                                println!("Get suggestion: {} {}", input, current_dir);
                                let result = get_suggestions(input, current_dir)?;
                                // println!("Result: {:?}", result);
                                Ok(result)
                            },
                            callback,
                            error,
                        ),
                    }
                    Ok(())
                }
            }
        })
        .build()
        .run();
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DirContent {
    path: String,
    file_name: String,
    is_dir: bool,
    is_file: bool,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum ViewType {
    Dir,
    Img,
    Text,
    Else,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ViewCommand {
    path: String,
    view_type: ViewType,
    // metadata
    content: String, // Parsed json
}

fn view_command(path: String) -> Result<ViewCommand> {
    println!("Path: {}", path);
    let ospath = OsStr::new(&path);
    let metadata = fs::metadata(ospath)?;

    // might break on windows
    let extension = Path::new(&path).extension();

    let mut view_type = if metadata.is_dir() {
        ViewType::Dir
    } else if let Some(extension) = extension {
        if ["png", "jpg"].contains(&extension.to_str().unwrap()) {
            ViewType::Img
        } else {
            ViewType::Text
        }
    } else {
        ViewType::Text
    };

    let content = match view_type {
        ViewType::Dir => {
            let entries = fs::read_dir(&path)?
                .map(|res| {
                    res.map(|e| DirContent {
                        path: e.path().to_str().unwrap().to_string(),
                        is_dir: e.metadata().unwrap().is_dir(),
                        file_name: e.file_name().to_str().unwrap().to_string(),
                        is_file: e.file_type().unwrap().is_file(),
                    })
                })
                .collect::<Result<Vec<_>, io::Error>>()?;

            serde_json::to_string(&entries)?
        }
        ViewType::Img => {
            let mut file = File::open(&path).unwrap();
            let mut vec = Vec::new();
            let _ = file.read_to_end(&mut vec);
            let base64 = encode(vec);
            format!(
                "data:image/{};base64,{}",
                extension.unwrap().to_str().unwrap(),
                base64
            )
        }
        ViewType::Text => {
            if let Ok(text) = fs::read_to_string(&path) {
                text
            } else {
                view_type = ViewType::Else;
                "".to_string()
            }
        }
        _ => "".to_string(),
    };

    Ok(ViewCommand {
        path,
        view_type,
        content,
    })
}
