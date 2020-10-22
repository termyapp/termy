use anyhow::Result;
use io::{BufReader, Read};
use serde::Serialize;
use std::env;
use std::io::Write;
use std::process::{Command, Stdio};
use std::{ffi::OsStr, io};

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
    _id: String,
    input: String,
    current_dir: String,
    send_chunk: napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<u8>>,
) -> Result<()> {
    println!("Running command: `{}` in {}", input, current_dir);

    let mut parts = input.trim().split_whitespace();
    let command = parts.next().expect("Failed to parse input");
    let args = parts.map(OsStr::new).collect::<Vec<&OsStr>>();
    match command {
        command => {
            let mut child = Command::new(command)
                .args(&args)
                .current_dir(current_dir)
                .envs(env::vars())
                .envs(env::vars_os())
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .expect("Command failed to start");

            // {
            //     let stdin = child.stdin.as_mut().expect("Failed to open stdin");
            //     stdin
            //         .write_all("Hello, world!".as_bytes())
            //         .expect("Failed to write to stdin");
            // }

            // let output = child.wait_with_output().expect("Failed to read stdout");

            let mut reader = BufReader::new(child.stdout.as_mut().unwrap());
            let mut chunk = [0u8; 1024];
            loop {
                let read = reader.read(&mut chunk);

                if let Ok(len) = read {
                    if len == 0 {
                        break;
                    }
                    let chunk = &chunk[..len];

                    // rust-analyzer complains, but it compiles ¯\_(ツ)_/¯
                    send_chunk.call(
                        Ok(chunk.clone().to_vec()),
                        napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
                    );
                } else {
                    eprintln!("Err: {}", read.unwrap_err());
                }
            }
        }
    }
    send_chunk.release(napi::threadsafe_function::ThreadsafeFunctionReleaseMode::Release);
    println!("It's over bois");
    Ok(())
}

/*

pub fn shell(
    _id: String,
    input: String,
    current_dir: String,
    send_chunk: napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<std::string::String>>,
) -> Result<()> {
    println!("Running command: `{}` in {}", input, current_dir);

    let mut parts = input.trim().split_whitespace();
    let command = parts.next().expect("Failed to parse input");
    let args = parts.map(OsStr::new).collect::<Vec<&OsStr>>();
    match command {
        command => {
            // todo: make programs think i'm a tty (run `tty`)
            // https://github.com/softprops/atty
            // https://nodejs.org/api/tty.html#tty_tt

            let p;

            {
                let popen = Exec::cmd(command)
                    .args(&args)
                    .cwd(current_dir)
                    .stdin(Redirection::Pipe)
                    .stdout(Redirection::Pipe)
                    .stderr(Redirection::Pipe)
                    .popen();

                if popen.is_err() {
                    // tauri::event::emit(
                    //     webview,
                    //     "event",
                    //     Some(Payload {
                    //         id: id.clone(),
                    //         chunk: popen.unwrap_err().to_string().as_bytes(),
                    //     }),
                    // )
                    // .expect("Failed to send popen error");
                    return Ok(());
                }

                p = popen.unwrap()
            };

            let mut stdout_reader = BufReader::new(p.stdout.as_ref().unwrap());
            let mut stderr_reader = BufReader::new(p.stderr.as_ref().unwrap());
            let mut chunk = [0u8; 1024];
            let _ = thread::scope(|s| {
                let _ = s.spawn(move |_| {
                    loop {
                        println!("here {}", chunk.len());

                        let read = stdout_reader.read(&mut chunk);
                        if let Ok(len) = read {
                            if len == 0 {
                                break;
                            }
                            let chunk = &chunk[..len];
                            // let event_result = tauri::event::emit(
                            //     webview,
                            //     "event",
                            //     Some(Payload {
                            //         id: id.clone(),
                            //         chunk,
                            //     }),
                            // );
                            // if let Err(err) = event_result {
                            //     println!("Failed to send chunk: {}", err);
                            // } else {
                            //     println!("Sent chunk");
                            // };
                            let s = std::str::from_utf8(chunk).unwrap().to_string();
                            let output = vec![s];

                            send_chunk.call(
                                Ok(output.clone()),
                                napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
                            );
                        } else {
                            eprintln!("Err: {}", read.unwrap_err());
                        }
                    }
                    send_chunk
                        .release(napi::threadsafe_function::ThreadsafeFunctionReleaseMode::Release);
                    loop {
                        println!("here {}", chunk.len());

                        let read = stderr_reader.read(&mut chunk);
                        if let Ok(len) = read {
                            if len == 0 {
                                break;
                            }
                            let chunk = &chunk[..len];
                        // let event_result = tauri::event::emit(
                        //     webview,
                        //     "event",
                        //     Some(Payload {
                        //         id: id.clone(),
                        //         chunk,
                        //     }),
                        // );
                        // if let Err(err) = event_result {
                        //     println!("Failed to send chunk: {}", err);
                        // } else {
                        //     println!("Sent chunk");
                        // };
                        } else {
                            eprintln!("Err: {}", read.unwrap_err());
                        }
                    }
                });

                // loop {
                //     // receive stdin message
                //     let received = receiver.recv();
                //     if let Ok(message) = received {
                //         if message == "Exit" {
                //             println!("Exiting");
                //             break;
                //         }

                //         // Delete doesn't work for stdin yet.
                //         // Also, current approach messes up the way vim and other _fullscreen_
                //         // program work.
                //         // Idea for a solution (currently assuming that nothing is a program):
                //         // check whether it's a program or not, if it is just pipe it
                //         // if it's not a program, send back the input and listen for enters
                //         // if enter is pressed, pipe send everything
                //         // *program = something that is listening for keyevents

                //         println!("Message received: {:?} {:?}", message, message.as_bytes());
                //         let message = message.as_bytes();
                //         let mut stdin = p.stdin.as_ref().expect("Failed to unwrap");
                //         let len = stdin.write(message).expect("Failed to write stdin");
                //         println!("Written: {}", len);

                //     // currently handling writing stdin in frontend (item.tsx)
                //     // let event_result = tauri::event::emit(
                //     //     &mut s2,
                //     //     "event",
                //     //     Some(Payload {
                //     //         id: id2.clone(),
                //     //         chunk: message.as_bytes(),
                //     //     }),
                //     // );
                //     // if let Err(err) = event_result {
                //     //     println!("Failed to send chunk: {}", err);
                //     // } else {
                //     //     println!("Sent chunk");
                //     // };
                //     } else {
                //         println!("No message or error");
                //     }

                //     // std::thread::sleep(time::Duration::from_millis(100));
                // }

                let exit_status = p.exit_status().unwrap();
                println!("Exited: {:?}", exit_status);
            });
        }
    }

    println!("It's over bois");
    Ok(())
}
*/
