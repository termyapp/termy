#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate base64;

use anyhow::Result;
use base64::{decode, encode};
use cmd::{PromptStruct, ViewStruct};
use fs::File;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use io::Read;
use serde::{Deserialize, Serialize};
use shell::shell;
use std::process::Command;
use std::{
    env,
    ffi::OsStr,
    fs,
    io::{self, BufRead, BufReader},
    path::Path,
};
use subprocess::Exec;
use tauri::WebviewMut;
mod cmd;
mod shell;

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
            let mut webview = _webview.as_mut();
            tauri::event::listen(String::from("event"), move |arg| {
                let event = arg.unwrap();
                let event: Event = serde_json::from_str(&event).unwrap();
                println!("Event: {:?}", event);

                match event.event_type.as_ref() {
                    "new" => {
                        if let Err(error) =
                            shell(&mut webview, event.input, event.current_dir, event.id)
                        {
                            println!("Error: {}", error);
                        } else {
                            println!("Success!");
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
                                let result = view_path(path)?;
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

                        _ => (),
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
pub struct ViewPath {
    path: String,
    view_type: ViewType,
    // metadata
    content: String, // Parsed json
}

fn view_path(path: String) -> Result<ViewPath> {
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
            let mut entries = fs::read_dir(&path)?
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

    Ok(ViewPath {
        path,
        view_type,
        content,
    })
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
    name: String,
    score: i64,
    command: String,
}

fn get_suggestions(input: String, current_dir: String) -> Result<Vec<Suggestion>> {
    let mut suggestions = vec![];
    let matcher = SkimMatcherV2::default();

    let mut parts = input.trim().split_whitespace();
    let command = parts.next().expect("Failed to parse input");
    let args = parts.collect::<Vec<&str>>();

    match command {
        "cd" => {
            let query_arg = args[0];
            let mut entries = fs::read_dir(current_dir)?
                .filter_map(|e| {
                    let entry = e.unwrap();
                    if !entry.metadata().unwrap().is_dir() {
                        return None;
                    }
                    let name = entry.path().to_str().unwrap().to_string();
                    let score = if let Some(score) = matcher.fuzzy_match(name.as_str(), query_arg) {
                        score
                    } else {
                        return None;
                    };
                    Some(Suggestion {
                        name,
                        score,
                        command: command.to_string(),
                    })
                })
                .collect::<Vec<Suggestion>>();
            suggestions.append(&mut entries);
        }
        command if !input.contains(" ") => {
            // list all the commands 😁
            let output = Command::new("bash")
                .args(&["-c", "compgen -A function -abck"])
                .output();
            if let Err(err) = output {
                println!("{}", err);
            } else {
                let mut commands = String::from_utf8(output.unwrap().stdout)?
                    .lines()
                    .filter_map(|line| {
                        let name = line.to_string();
                        let score = if let Some(score) = matcher.fuzzy_match(name.as_str(), command)
                        {
                            score
                        } else {
                            return None;
                        };
                        Some(Suggestion {
                            name: name,
                            score,
                            command: command.to_string(),
                        })
                    })
                    .collect::<Vec<Suggestion>>();

                suggestions.append(&mut commands);
            }
        }
        _ => (),
    }
    suggestions.sort_by(|a, b| b.score.cmp(&a.score));

    Ok(suggestions)
}
