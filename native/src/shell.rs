use anyhow::Result;
use crossbeam_channel::{Receiver, Sender};
use io::{BufReader, Read};
use portable_pty::{native_pty_system, CommandBuilder, PtySize, PtySystem};
use serde::Serialize;
use std::thread;
use std::{env, path::Path};
use std::{ffi::OsStr, io};
use std::{fs, io::Write};

pub struct Command {
    id: String,
    current_dir: String,
    input: String,
    command: String,
    args: Vec<String>,
}

impl Command {
    pub fn new(id: String, current_dir: String, input: String) -> Command {
        let mut parts = input.trim().split_whitespace();
        let command = parts.next().expect("Failed to parse input").to_owned();
        let args = parts.map(|arg| String::from(arg)).collect::<Vec<String>>();

        Command {
            id,
            current_dir,
            input,
            command,
            args,
        }
    }

    pub fn exec(
        self,
        send_stdout: napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<u8>>,
        receiver: Receiver<String>,
        sender: Sender<String>,
    ) -> Result<bool> {
        println!(
            "Executing command: `{}` in {}",
            self.input, self.current_dir
        );
        match self.command.as_ref() {
            "move" => {
                // move arg1 arg2
                let mut args = self.args.iter();
                let from = self.current_dir.clone() + args.next().unwrap();
                let from = Path::new(&from);
                let to = self.current_dir.clone() + args.next().unwrap();
                let to = Path::new(&to);
                from.canonicalize()?;
                fs::rename(from, to)?;
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

                            // rust-analyzer complains, but it compiles ¯\_(ツ)_/¯
                            send_stdout.call(
                                Ok(chunk.clone().to_vec()),
                                napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
                            );
                        } else {
                            eprintln!("Err: {}", read.unwrap_err());
                        }
                    }

                    send_stdout
                        .release(napi::threadsafe_function::ThreadsafeFunctionReleaseMode::Release);
                    println!("Released send_stdout");
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

const KILL_COMMAND_MESSAGE: &'static str = "TERMY_KILL_COMMAND";

#[derive(Serialize, Debug)]
struct Payload<'a> {
    id: String,
    chunk: &'a [u8],
}
