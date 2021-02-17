use crate::shell::{tsfn_send, Cell, CellChannel, Data, ServerMessage, Status};
use anyhow::Result;
use io::Read;
use log::{error, info, warn};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::Deserialize;
use std::io::Write;
use std::thread;
use std::{
  io,
  sync::{Arc, Mutex},
};

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

  let mut reader = pair.master.try_clone_reader()?;
  let child = Arc::new(Mutex::new(pair.slave.spawn_command(cmd)?));
  let master = Arc::new(Mutex::new(pair.master));
  let child_clone = Arc::clone(&child);
  let master_clone = Arc::clone(&master);

  drop(pair.slave);

  let tsfn_clone = cell
    .tsfn
    .try_clone()
    .expect("Failed to clone threadsafe function");
  let sender_clone = cell.sender.clone();

  let paused = Arc::new(Mutex::new(false));
  let paused_clone = Arc::clone(&paused);

  thread::spawn(move || {
    // Stop-and-wait type flow control works fine here
    // since message passing time is negligible
    // https://en.wikipedia.org/wiki/Flow_control_(data)
    // https://xtermjs.org/docs/guides/flowcontrol/
    let mut chunk = [0u8; 1024];

    loop {
      if (*child_clone.lock().expect("Failed to lock child"))
        .try_wait()
        .unwrap()
        .is_some()
      {
        info!("Breaking out");
        break;
      }

      let mut paused = paused.lock().expect("Failed to lock paused");
      // todo: maybe wait ~10ms here so it's not checking that much?
      // or: https://doc.rust-lang.org/std/sync/struct.Condvar.html
      // or: go back to message based communication
      if !(*paused) {
        *paused = true;

        let read = reader.read(&mut chunk);
        if let Ok(len) = read {
          if len == 0 {
            info!("Breaking out");
            break;
          }
          let chunk = &chunk[..len];

          info!("Sending chunk with length: {}", chunk.len());
          tsfn_send(
            &tsfn_clone,
            ServerMessage::new(Data::Text(chunk.to_vec()), None),
          );
        } else {
          error!("Err: {}", read.unwrap_err());
        }
      }
    }

    let master_clone = master_clone.lock().unwrap();
    drop(master_clone);

    let mut remaining_chunk = vec![];
    reader
      .read_to_end(&mut remaining_chunk)
      .expect("failed to read remian chunk");

    info!("Sending last chunk");
    tsfn_send(
      &tsfn_clone,
      ServerMessage::new(Data::Text(remaining_chunk), None),
    );

    if let Err(err) = sender_clone.send(CellChannel::Exit) {
      error!("Error while sending exit code: {}", err);
    };
  });

  loop {
    // receive cell channel message
    let received = cell.receiver.recv(); // hangs

    match received {
      Ok(CellChannel::FrontendMessage(FrontendMessage { id, action })) => match action {
        Action::Resume => {
          info!("Action Resuming");
          let mut paused = paused_clone.lock().expect("Failed to lock paused clone");
          *paused = false;
          info!("Action Resumed");
        }
        Action::Kill => {
          let mut child = child.lock().unwrap();
          info!("Killing child");
          child.kill().expect("Failed to kill child");
        }
        Action::Write(data) => {
          info!("Writing data: {:?}", data);
          let mut master = master.lock().unwrap();
          write!(*master, "{}", data).expect("Failed to write to master");
        }
        Action::Resize(Size { rows, cols }) => {
          info!("Resizing Pty: {} {}", rows, cols);
          let master = master.lock().unwrap();
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
      },
      Ok(CellChannel::Exit) => {
        let mut child = child.lock().unwrap();
        let successful = child.wait().expect("Failed to unwrap child").success();
        return Ok(if successful {
          Status::Success
        } else {
          Status::Error
        });
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
  action: Action,
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Size {
  rows: u16,
  cols: u16,
}
