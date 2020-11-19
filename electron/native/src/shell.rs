use anyhow::Result;
use crossbeam_channel::{Receiver, Sender};
use io::Read;
use log::{error, info, warn};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use relative_path::RelativePath;
use serde::{Deserialize, Serialize};
use std::io;
use std::path::Path;
use std::thread;
use std::{fs, io::Write};

// todo: refactor this huge mess
// https://stackoverflow.com/questions/57649032/returning-a-value-from-a-function-that-spawns-threads

pub struct Cell {
    id: String,
    pub current_dir: String,
    pub input: String,
    command: String,
    args: Vec<String>,
}

impl Cell {
    pub fn new(props: RunCell) -> Cell {
        let RunCell {
            input,
            id,
            current_dir,
        } = props;
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

    pub fn run(
        self,
        shell_sender: ThreadsafeFunctionType,
        receiver: Receiver<CellChannel>,
        sender: Sender<CellChannel>,
    ) -> Result<()> {
        info!(
            "Executing command: `{}` in {}",
            self.input, self.current_dir
        );
        let send_message = SendMessage::new(shell_sender);

        send_message.send(ServerMessage::status(Status::Running));

        if let Some(server_message) = match self.command.as_ref() {
            "/" => {
                let path = RelativePath::new("").to_path("/");

                if path.is_dir() {
                    ServerMessage::api(
                        format!("Changed current directory to {}", path.to_string_lossy()),
                        Some(path.to_string_lossy().to_string()),
                        Status::Success,
                    )
                } else {
                    ServerMessage::api(
                        format!("{} is not a valid directory", path.to_string_lossy()),
                        None,
                        Status::Error,
                    )
                }
            }
            "home" => {
                let home_dir = dirs::home_dir().unwrap().as_os_str().to_owned();
                ServerMessage::api(
                    format!("Home Directory: {:?}", home_dir),
                    None,
                    Status::Success,
                )
            }
            dir if RelativePath::new(&self.current_dir)
                .join_normalized(RelativePath::new(dir))
                .to_path(Path::new(""))
                .is_dir() =>
            {
                let path = dir;
                let relative_path = RelativePath::new(path);
                let cwd = RelativePath::new(&self.current_dir);
                let absolute_path = cwd.join_normalized(relative_path).to_path(Path::new(""));

                if absolute_path.is_dir() {
                    ServerMessage::api(
                        format!(
                            "Changed current directory to {}",
                            absolute_path.to_string_lossy()
                        ),
                        Some(absolute_path.to_string_lossy().to_string()),
                        Status::Success,
                    )
                } else {
                    ServerMessage::api(
                        format!(
                            "{} is not a valid directory",
                            absolute_path.to_string_lossy()
                        ),
                        None,
                        Status::Error,
                    )
                }
            }
            "cd" => {
                // todo: absolute paths and /, ~, ...
                let path = self.args.iter().next().unwrap();
                let relative_path = RelativePath::new(path);
                let cwd = RelativePath::new(&self.current_dir);
                let absolute_path = cwd.join_normalized(relative_path).to_path(Path::new(""));

                if absolute_path.is_dir() {
                    ServerMessage::api(
                        format!(
                            "Changed current directory to {}",
                            absolute_path.to_string_lossy()
                        ),
                        Some(absolute_path.to_string_lossy().to_string()),
                        Status::Success,
                    )
                } else {
                    ServerMessage::api(
                        format!(
                            "{} is not a valid directory",
                            absolute_path.to_string_lossy()
                        ),
                        None,
                        Status::Error,
                    )
                }
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

                ServerMessage::api("Moved file".to_owned(), None, Status::Success)
            }
            _ => None,
        } {
            send_message.send(server_message);
            send_message.release();
        } else {
            let command = self.command;
            let pty_system = native_pty_system();
            let mut pair = pty_system.openpty(PtySize {
                rows: 15,
                cols: 80,
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
            let mut i = 0;
            thread::spawn(move || {
                // let mut chunk = [0u8; 10000]; 6899
                // let mut chunk = [0u8; 1024]; 7086
                // let mut chunk = [0u8; 64]; 37651
                let mut chunk = [0u8; 1024];

                // todo: flowcontrol - pause here
                // https://xtermjs.org/docs/guides/flowcontrol/
                // also, buffer chunks to minimize ipc calls
                // can't read_exact because than programs that expect input won't work

                loop {
                    let read = reader.read(&mut chunk);

                    if let Ok(len) = read {
                        if len == 0 {
                            break;
                        }
                        let chunk = &chunk[..len];
                        i += 1;
                        info!("Sending chunk: {} {}", i, chunk.len());
                        let data = ServerData::PtyData(chunk.to_vec());
                        send_message.send(ServerMessage {
                            output: Some(Output {
                                data,
                                cell_type: CellType::Pty,
                                cd: None,
                            }),
                            status: None,
                        });
                    } else {
                        error!("Err: {}", read.unwrap_err());
                    }
                }
                sender
                    .send(CellChannel::SendMessage(send_message))
                    .expect("Failed to pass send_message over");
            });

            while child.try_wait()?.is_none() {
                // receive stdin message
                let received = receiver.recv();
                match received {
                    Ok(CellChannel::FrontendMessage(FrontendMessage { id, stdin, size })) => {
                        if let Some(message) = stdin {
                            // Send data to the pty by writing to the master
                            write!(pair.master, "{}", message).expect("Failed to write to master");

                            info!("Stdin written: {:?}", message);
                        } else if let Some(Size { rows, cols }) = size {
                            pair.master
                                .resize(PtySize {
                                    rows,
                                    cols,
                                    pixel_width: 0,
                                    pixel_height: 0,
                                })
                                .expect("Failed to resize pty");

                            info!("Resized pty: {} {}", rows, cols);
                        } else {
                            warn!("Invalid frontend message")
                        }
                    }
                    Ok(CellChannel::SendMessage(send_message)) => {
                        info!("Exiting");
                        // portable_pty only has boolean support for now
                        send_message.send(ServerMessage {
                            output: None,
                            status: Some(if child.wait().unwrap().success() {
                                Status::Success
                            } else {
                                Status::Error
                            }),
                        });
                        send_message.release();
                    }
                    _ => {
                        error!("Received no message or error");
                    }
                }
            }
        }

        info!(
            "Finished running cell `{}` with input {}",
            self.id, self.input
        );

        Ok(())
    }
}

impl SendMessage {
    fn new(threadsafe_function: ThreadsafeFunctionType) -> SendMessage {
        SendMessage {
            threadsafe_function,
        }
    }

    fn send(&self, message: ServerMessage) {
        // rust-analyzer complains, but it compiles ¯\_(ツ)_/¯
        self.threadsafe_function.call(
            Ok(vec![message]),
            napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
        );
    }

    fn release(self) {
        self.threadsafe_function
            .release(napi::threadsafe_function::ThreadsafeFunctionReleaseMode::Release);
        info!("Released threadsafe function");
    }
}

struct SendMessage {
    threadsafe_function: ThreadsafeFunctionType,
}

type ThreadsafeFunctionType =
    napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<ServerMessage>>;

pub enum CellChannel {
    SendMessage(SendMessage),
    FrontendMessage(FrontendMessage),
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RunCell {
    id: String,
    current_dir: String,
    input: String,
}
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Size {
    rows: u16,
    cols: u16,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrontendMessage {
    id: String,
    stdin: Option<String>,
    size: Option<Size>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ServerMessage {
    #[serde(skip_serializing_if = "Option::is_none")]
    output: Option<Output>,
    #[serde(skip_serializing_if = "Option::is_none")]
    status: Option<Status>,
}

impl ServerMessage {
    fn api(data: String, cd: Option<String>, status: Status) -> Option<Self> {
        Some(Self {
            output: Some(Output {
                data: ServerData::ApiData(data),
                cell_type: CellType::Api,
                cd,
            }),
            status: Some(status),
        })
    }

    fn status(status: Status) -> Self {
        Self {
            output: None,
            status: Some(status),
        }
    }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum ServerData {
    ApiData(String),
    PtyData(Vec<u8>),
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Output {
    data: ServerData,
    #[serde(rename = "type")]
    cell_type: CellType,
    cd: Option<String>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum Status {
    Running,
    Success,
    Error,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum CellType {
    Pty,
    Api,
}
