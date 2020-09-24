use anyhow::Result;
use crossbeam_utils::thread;
use io::{BufReader, Read};
use serde::Serialize;
use std::io::prelude::*;
use std::{env, ffi::OsStr, io};
use subprocess::{Exec, Redirection};
use tauri::WebviewMut;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LsOutput {
    path: String,
    file_name: String,
    is_dir: bool,
    is_file: bool,
}

#[derive(Serialize, Debug)]
struct Payload<'a> {
    id: String,
    chunk: &'a [u8],
}

pub fn shell(
    webview: &mut WebviewMut,
    receiver: crossbeam_channel::Receiver<String>,
    id: String,
    input: String,
    current_dir: String,
) -> Result<()> {
    println!("Running command: `{}` in {}", input, current_dir);

    let mut parts = input.trim().split_whitespace();
    let command = parts.next().expect("Failed to parse input");
    let args = parts.map(OsStr::new).collect::<Vec<&OsStr>>();

    match command {
        command => {
            // todo: set env vars

            let mut p = Exec::cmd(command)
                .args(&args)
                .cwd(current_dir)
                .stdin(Redirection::Pipe)
                .stdout(Redirection::Pipe)
                .stderr(Redirection::Pipe)
                .popen()
                .unwrap();

            let mut reader = BufReader::new(p.stdout.as_ref().unwrap());
            let mut chunk = [0u8; 1024];
            let scope = thread::scope(|s| {
                let handle = s.spawn(move |_| loop {
                    println!("here {}", chunk.len());

                    let read = reader.read(&mut chunk);
                    if let Ok(len) = read {
                        if len == 0 {
                            break;
                        }
                        let chunk = &chunk[..len];
                        let event_result = tauri::event::emit(
                            webview,
                            "event",
                            Some(Payload {
                                id: id.clone(),
                                chunk,
                            }),
                        );
                        if let Err(err) = event_result {
                            println!("Failed to send chunk: {}", err);
                        } else {
                            println!("Sent chunk");
                        };
                    } else {
                        eprintln!("Err: {}", read.unwrap_err());
                    }
                });

                loop {
                    // receive stdin message
                    let received = receiver.recv();
                    if let Ok(message) = received {
                        if message == "Exit" {
                            println!("Exiting");
                            break;
                        }

                        // Delete doesn't work for stdin yet.
                        // Also, current approach messes up the way vim and other _fullscreen_
                        // program work.
                        // Idea for a solution (currently assuming that nothing is a program):
                        // check whether it's a program or not, if it is just pipe it
                        // if it's not a program, send back the input and listen for enters
                        // if enter is pressed, pipe send everything
                        // *program = something that is listening for keyevents

                        println!("Message received: {:?} {:?}", message, message.as_bytes());
                        let message = message.as_bytes();
                        let mut stdin = p.stdin.as_ref().expect("Failed to unwrap");
                        let len = stdin.write(message).expect("Failed to write stdin");
                        println!("Written: {}", len);

                    // currently handling writing stdin in frontend (item.tsx)
                    // let event_result = tauri::event::emit(
                    //     &mut s2,
                    //     "event",
                    //     Some(Payload {
                    //         id: id2.clone(),
                    //         chunk: message.as_bytes(),
                    //     }),
                    // );
                    // if let Err(err) = event_result {
                    //     println!("Failed to send chunk: {}", err);
                    // } else {
                    //     println!("Sent chunk");
                    // };
                    } else {
                        println!("No message or error");
                    }
                }

                let exit_status = p.exit_status().unwrap();
                println!("Exited: {:?}", exit_status);
            });
        }
    }

    println!("It's over bois");

    Ok(())
}
