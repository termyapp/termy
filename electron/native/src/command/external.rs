use crate::cell::{tsfn_send, Cell, CellChannel, OutputType, ServerMessage, Status};
use anyhow::Result;
use io::Read;
use log::{error, info, warn};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::Deserialize;
use std::io;
use std::io::Write;
use std::thread;

pub fn external(command: &String, args: Vec<String>, cell: Cell) -> Result<Status> {
    info!("Running pty command: {:#?}", command);
    let pty_system = native_pty_system();
    let mut pair = pty_system.openpty(PtySize {
        rows: 15,
        cols: 80,
        pixel_width: 0,
        pixel_height: 0,
    })?;

    // examples: https://github.com/wez/wezterm/tree/e2e46cb50d32562cdb02e0a8d309fa9f7fbbecf0/pty/examples
    let mut cmd = CommandBuilder::new(command);

    cmd.env("LANG", "en_US.UTF-8");
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");
    cmd.env("TERM_PROGRAM", "Termy");
    cmd.env("TERM_PROGRAM_VERSION", "v0.1.3"); // todo: use a var here

    cmd.cwd(&cell.current_dir());
    cmd.args(args);

    let mut child = pair.slave.spawn_command(cmd)?;

    // Read an from the pty with reader
    let mut reader = pair.master.try_clone_reader()?;
    let mut i = 0;

    let tsfn_clone = cell
        .tsfn
        .try_clone()
        .expect("Failed to clone threadsafe function");
    let sender_clone = cell.sender.clone();

    thread::spawn(move || {
        let mut chunk = [0u8; 1024];

        // todo: flowcontrol - pause here
        // https://xtermjs.org/docs/guides/flowcontrol/
        // also, buffer chunks to minimize ipc calls
        // can't read_exact because than programs that expect input won't work

        loop {
            let read = reader.read(&mut chunk);

            if let Ok(len) = read {
                if len == 0 {
                    // todo: doesn't get here on windows
                    break;
                }
                let chunk = &chunk[..len];
                i += 1;
                info!("Sending chunk: {} {}", i, chunk.len());
                // let data = ServerData::PtyData(chunk.to_vec());
                tsfn_send(
                    &tsfn_clone,
                    ServerMessage::output(OutputType::Text(chunk.to_vec()), None),
                );
            } else {
                error!("Err: {}", read.unwrap_err());
            }
        }

        if let Err(err) = sender_clone.send(CellChannel::Exit) {
            error!("Error while sending exit code: {}", err);
        };
    });

    loop {
        // receive cell channel message
        let received = cell.receiver.recv(); // hangs

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
            Ok(CellChannel::Exit) => {
                return Ok(if child.wait()?.success() {
                    Status::Success
                } else {
                    Status::Error
                });
            }
            Err(err) => error!("Error while receiving message: {}", err),
        }
    }
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrontendMessage {
    id: String,
    stdin: Option<String>,
    size: Option<Size>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Size {
    rows: u16,
    cols: u16,
}
