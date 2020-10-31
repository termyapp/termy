use anyhow::Result;
use crossbeam_channel::{Receiver, Sender};
use io::Read;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::Serialize;
use std::io;
use std::thread;
use std::{env, path::Path};
use std::{fs, io::Write};

pub struct Cell {
    id: String,
    current_dir: String,
    input: String,
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
            "move" | "home" => return CellType::API,
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
                    rows: 24,
                    cols: 100,
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

    fn send(&self, mut output: String) {
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
struct Payload<'a> {
    id: String,
    chunk: &'a [u8],
}
