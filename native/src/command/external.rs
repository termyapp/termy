use crate::shell::{tsfn_send, Cell, CellChannel, Data, ServerMessage, Status};
use anyhow::Result;
use core::time;
use io::Read;
use log::{error, info};
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

  let mut master = pair.master;
  let mut reader = master.try_clone_reader()?;
  let mut reader_inner = master.try_clone_reader()?;
  let child = Arc::new(Mutex::new(pair.slave.spawn_command(cmd)?));
  let child_inner = Arc::clone(&child);

  let tsfn = cell
    .tsfn
    .try_clone()
    .expect("Failed to clone threadsafe function");
  let tsfn_inner = cell
    .tsfn
    .try_clone()
    .expect("Failed to clone threadsafe function");

  let sender_clone = cell.sender.clone();

  let paused = Arc::new(Mutex::new(false));
  let paused_clone = Arc::clone(&paused);

  drop(pair.slave);

  thread::spawn(move || {
    // Stop-and-wait type flow control works fine here
    // since message passing time is negligible
    // https://en.wikipedia.org/wiki/Flow_control_(data)
    // https://xtermjs.org/docs/guides/flowcontrol/
    let mut chunk = [0u8; 1024];

    loop {
      if (*child_inner.lock().expect("Failed to lock child"))
        .try_wait()
        .expect("Failed to poll child")
        .is_some()
      {
        info!("Breaking out 1");
        break;
      }

      let mut paused = paused.lock().expect("Failed to lock paused");
      if *paused {
        // todo: find a better way to block thread until we can resume
        // maybe go back to channels and block on .recv()
        // or https://doc.rust-lang.org/std/sync/struct.Condvar.html
        thread::sleep(time::Duration::from_millis(10));
      } else {
        *paused = true;

        let read = reader_inner.read(&mut chunk);
        if let Ok(len) = read {
          if len == 0 {
            info!("Breaking out 2");
            break;
          }
          let chunk = &chunk[..len];

          info!("Sending chunk with length: {}", chunk.len());
          tsfn_send(
            &tsfn_inner,
            ServerMessage::new(Data::Text(chunk.to_vec()), None),
          );
        } else {
          error!("Err: {}", read.unwrap_err());
        }
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
      Ok(CellChannel::FrontendMessage(FrontendMessage { id: _, action })) => match action {
        Action::Resume => {
          info!("Resuming");
          let mut paused = paused_clone.lock().expect("Failed to lock paused clone");
          *paused = false;
        }
        Action::Kill => {
          info!("Killing child");
          let mut child = child.lock().unwrap();
          child.kill().expect("Failed to kill child");
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
      },
      Ok(CellChannel::Exit) => {
        // this is why we need to read the last chunk in a
        // different thread: https://github.com/wez/wezterm/issues/463
        drop(master);

        let mut remaining_chunk = vec![];
        reader
          .read_to_end(&mut remaining_chunk)
          .expect("Failed to read remaining chunk");

        info!("Sending last chunk");
        tsfn_send(&tsfn, ServerMessage::new(Data::Text(remaining_chunk), None));

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

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrontendMessage {
  id: String,
  action: Action,
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
enum Action {
  Resume,
  Kill,
  Write(String),
  Resize(Size),
}

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Size {
  rows: u16,
  cols: u16,
}
