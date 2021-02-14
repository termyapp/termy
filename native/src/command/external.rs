use crate::shell::{tsfn_send, Cell, CellChannel, Data, ServerMessage, Status};
use anyhow::Result;
use crossbeam_channel::unbounded;
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
  let pair = pty_system.openpty(PtySize {
    rows: 50,
    cols: 100,
    pixel_width: 0,
    pixel_height: 0,
  })?;

  // examples: https://github.com/wez/wezterm/tree/e2e46cb50d32562cdb02e0a8d309fa9f7fbbecf0/pty/examples
  let mut cmd = CommandBuilder::new(command);

  cmd.env("LANG", "en_US.UTF-8");
  cmd.env("TERM", "xterm-256color");
  cmd.env("COLORTERM", "truecolor");
  cmd.env("TERM_PROGRAM", "Termy");
  cmd.env("TERM_PROGRAM_VERSION", "v0.2"); // todo: use a var here
  cmd.cwd(&cell.current_dir());
  cmd.args(args);

  let mut child = pair.slave.spawn_command(cmd)?;
  let mut master = pair.master;
  let mut reader = master.try_clone_reader()?;
  drop(pair.slave);

  let tsfn_clone = cell
    .tsfn
    .try_clone()
    .expect("Failed to clone threadsafe function");
  let sender_clone = cell.sender.clone();
  let (action_sender, action_receiver) = unbounded::<Action>();

  thread::spawn(move || {
    // Stop-and-wait type flow control works fine here
    // since message passing time is negligible
    // https://en.wikipedia.org/wiki/Flow_control_(data)
    // https://xtermjs.org/docs/guides/flowcontrol/
    let mut paused = false;
    let mut chunk = [0u8; 1024];

    loop {
      if paused {
        match action_receiver.recv() {
          Ok(Action::Resume) => {
            paused = false;
            continue;
          }
          _ => {
            error!("Error receiving in flow channel");
          }
        }
      } else {
        paused = true;
        info!("LESGOOO");

        // match action_receiver.try_recv() {

        let len = reader.read(&mut chunk).expect("AHAHAHAHA");

        info!("REAAAAAd len: {}", len);
        if len == 0 {
          info!("BREAAAAk");
          break;
        }
        let data = &chunk[..len];

        info!("Sending data with length: {}", data.len());
        tsfn_send(
          &tsfn_clone,
          ServerMessage::new(Data::Text(data.to_vec()), None),
        );

        if child.try_wait().unwrap().is_some() {
          sender_clone.send(CellChannel::Reader(reader));
          break;
        }
      }
    }

    if let Err(err) = sender_clone.send(if child.wait().expect("Failed to poll child").success() {
      CellChannel::Success
    } else {
      CellChannel::Error
    }) {
      error!("Error while sending exit code: {}", err);
    };
  });

  loop {
    // receive cell channel message
    let received = cell.receiver.recv(); // hangs

    match received {
      Ok(CellChannel::FrontendMessage(message)) => {
        if let Some(action) = message.action {
          //   if let Ok(()) = action_sender.send(action) {
          //     info!("Sent action");
          //   } else {
          //     error!("Failed to send action");
          //   }
          // } else {
          //   warn!("Invalid frontend message")
          // }
          match action {
            Action::Resume => {
              // paused = false;
            }
            Action::Kill => {
              // child.kill().expect("Failed to kill child"); // sounds pretty bad
            }
            Action::Write(data) => {
              info!("Writing data: {:?}", data);
              write!(master, "{}", data).expect("Failed to write to master");
            }
            Action::Resize(Size { rows, cols }) => {
              info!("Resizing Pty: {} {}", rows, cols);
              master
                .resize(PtySize {
                  rows,
                  cols,
                  pixel_width: 0,
                  pixel_height: 0,
                })
                .expect("Failed to resize pty");
            }
            _ => {
              error!("Error receiving in flow channel");
            }
          }
        }
      }
      Ok(CellChannel::Success) => return Ok(Status::Success),
      Ok(CellChannel::Error) => return Ok(Status::Error),
      Ok(CellChannel::Reader(reader)) => {
        drop(master);

        let mut vec = vec![];
        let len = reader.read_to_end(&mut vec).expect("AHAHAHAHA");
        info!("Sending data with length3213213213211: {}", len);
        tsfn_send(&tsfn_clone, ServerMessage::new(Data::Text(vec), None));
      }
      Err(err) => error!("Error while receiving message: {}", err),
    }
  }
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
enum Action {
  Resume,
  Kill,
  Write(String),
  Resize(Size),
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrontendMessage {
  id: String,
  action: Option<Action>,
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Size {
  rows: u16,
  cols: u16,
}
