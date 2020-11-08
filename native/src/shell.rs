use anyhow::Result;
use crossbeam_channel::{Receiver, Sender};
use io::Read;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use relative_path::RelativePath;
use serde::Serialize;
use std::io;
use std::path::Path;
use std::thread;
use std::{fs, io::Write};

pub struct Cell {
    id: String,
    pub current_dir: String,
    pub input: String,
    command: String,
    args: Vec<String>,
}

impl Cell {
    pub fn new(id: String, current_dir: String, input: String) -> Cell {
        let mut parts = input.trim().split_whitespace();
        let command = parts.next().expect("Failed to parse input").to_owned();
        let args = parts.map(|arg| String::from(arg)).collect::<Vec<String>>();

        Cell {
            id,
            current_dir,
            input,
            command,
            args,
        }
    }

    pub fn api(command: String) -> String {
        match command.as_ref() {
            "home" => {
                let home_dir = dirs::home_dir().unwrap().as_os_str().to_owned();
                return home_dir.to_string_lossy().to_string();
            }
            command => {
                return format!("Invalid command: {}", command);
            }
        }
    }

    pub fn get_type(&self) -> CellType {
        match self.command.as_ref() {
            "move" | "home" | "cd" => return CellType::API,
            _ => return CellType::PTY,
        }
    }

    pub fn run(
        self,
        send_output: napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<String>>,
        receiver: Receiver<String>,
        sender: Sender<String>,
    ) -> Result<bool> {
        println!(
            "Executing command: `{}` in {}",
            self.input, self.current_dir
        );
        let send_output = SendOutput::new(send_output);

        match self.command.as_ref() {
            "home" => {
                let home_dir = dirs::home_dir().unwrap().as_os_str().to_owned();
                send_output.send(format!("Home Directory: {:?}", home_dir));
                send_output.release();
            }
            "cd" => {
                // todo: absolute paths and /, ~, ...
                let path = self.args.iter().next().unwrap();
                let relative_path = RelativePath::new(path);
                let cwd = RelativePath::new(&self.current_dir);
                let absolute_path = cwd.join_normalized(relative_path).to_path(Path::new(""));

                let output = if absolute_path.is_dir() {
                    ApiOutput {
                        output: format!(
                            "Changed current directory to {}",
                            absolute_path.to_string_lossy()
                        ),
                        cd: Some(absolute_path.to_string_lossy().to_string()),
                    }
                } else {
                    ApiOutput {
                        output: format!(
                            "{} is not a valid directory",
                            absolute_path.to_string_lossy()
                        ),
                        cd: None,
                    }
                };
                let output = serde_json::to_string(&output)?;

                send_output.send(output);
                send_output.release();
            }
            "move" => {
                // move arg1 arg2
                let mut args = self.args.iter();
                let from = self.current_dir.clone() + args.next().unwrap();
                let from = Path::new(&from);
                let to = self.current_dir.clone() + args.next().unwrap();
                let to = Path::new(&to);
                from.canonicalize()?;
                fs::rename(from, to)?;

                send_output.send("Moved file".to_owned());
                send_output.release();
            }
            command => {
                let pty_system = native_pty_system();
                let mut pair = pty_system.openpty(PtySize {
                    rows: 20,
                    cols: 50,
                    pixel_width: 0,
                    pixel_height: 0,
                })?;

                // todo: env vars?
                let mut cmd = CommandBuilder::new(command);
                cmd.cwd(self.current_dir);
                cmd.args(self.args);
                let mut child = pair.slave.spawn_command(cmd)?;

                // Read and parse output from the pty with reader
                let mut reader = pair.master.try_clone_reader()?;

                thread::spawn(move || {
                    let mut chunk = [0u8; 1024];

                    loop {
                        let read = reader.read(&mut chunk);

                        if let Ok(len) = read {
                            if len == 0 {
                                break;
                            }
                            let chunk = &chunk[..len];
                            let output =
                                std::str::from_utf8(chunk).expect("Failed to convert the chunk");
                            send_output.send(output.to_string());
                        } else {
                            eprintln!("Err: {}", read.unwrap_err());
                        }
                    }

                    send_output.release();
                    sender
                        .send(KILL_COMMAND_MESSAGE.to_string())
                        .expect("Failed to send Exit");
                });

                while child.try_wait()?.is_none() {
                    // receive stdin message
                    let received = receiver.recv();
                    if let Ok(message) = received {
                        println!("Message received: {:?} {:?}", message, message.as_bytes());

                        if message == KILL_COMMAND_MESSAGE || child.try_wait()?.is_some() {
                            println!("Exiting");
                            break;
                        }
                        // Send data to the pty by writing to the master
                        write!(pair.master, "{}", message).expect("Failed to write to master");
                    } else {
                        println!("No message or error");
                    }
                }

                println!("Finished running processs");

                // portable_pty only has boolean support for now
                return Ok(child.wait().unwrap().success());
            }
        }

        println!(
            "Finished executing command `{}` in {}",
            self.input, self.current_dir
        );
        Ok(true)
    }
}

struct SendOutput {
    threadsafe_function: napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<String>>,
}

impl SendOutput {
    fn new(
        threadsafe_function: napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<String>>,
    ) -> SendOutput {
        SendOutput {
            threadsafe_function,
        }
    }

    fn send(&self, output: String) {
        // rust-analyzer complains, but it compiles ¯\_(ツ)_/¯
        self.threadsafe_function.call(
            Ok(vec![output]),
            napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
        );
    }

    fn release(self) {
        self.threadsafe_function
            .release(napi::threadsafe_function::ThreadsafeFunctionReleaseMode::Release);
        println!("Released threadsafe function");
    }
}

pub enum CellType {
    PTY,
    API,
}

const KILL_COMMAND_MESSAGE: &'static str = "TERMY_KILL_COMMAND";

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ApiOutput {
    output: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    cd: Option<String>,
}
