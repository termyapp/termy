use crate::shell::{tsfn_send, Cell, CellChannel, Data, ServerMessage, Status};
use anyhow::Result;
use crossbeam_channel::unbounded;
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

pub fn external(command: &str, args: Vec<String>, cell: Cell) -> Result<Status> {
  info!("Running external command: {:#?}", command);

  let pty_system = native_pty_system();
  let pair = pty_system.openpty(PtySize::default())?;
  let mut cmd = get_cmd(command, args);
  cmd.cwd(&cell.current_dir());
  for (key, val) in ENVS.iter() {
    cmd.env(key, val);
  }

  let child = Arc::new(Mutex::new(pair.slave.spawn_command(cmd)?));
  let child_inner = Arc::clone(&child);
  let mut master = pair.master;
  let mut reader = master.try_clone_reader()?;
  let mut reader_inner = master.try_clone_reader()?;

  let tsfn = cell.clone_tsfn();
  let tsfn_inner = cell.clone_tsfn();
  let sender_inner = cell.sender.clone();
  let (control_flow_sender, control_flow_receiver) = unbounded::<Action>();

  drop(pair.slave);

  thread::spawn(move || {
    // Stop-and-wait type flow control works fine here
    // since message passing time is negligible
    // https://en.wikipedia.org/wiki/Flow_control_(data)
    // https://xtermjs.org/docs/guides/flowcontrol/
    let mut chunk = [0u8; 1024];
    let mut paused = false;

    loop {
      info!("Start of loop");

      if (*child_inner.lock().expect("Failed to lock child"))
        .try_wait()
        .expect("Failed to poll child")
        .is_some()
      {
        info!("Breaking out 0");
        break;
      }

      if paused {
        // blocks thread
        if let Ok(Action::Resume) = control_flow_receiver.recv() {
          info!("Resuming")
        } else {
          error!("Failed to receive control flow action");
        }
      } else {
        paused = true;

        if (*child_inner.lock().expect("Failed to lock child"))
          .try_wait()
          .expect("Failed to poll child")
          .is_some()
        {
          info!("Breaking out 1");
          break;
        }

        let read = reader_inner.read(&mut chunk);

        info!("read");
        if let Ok(len) = read {
          if len == 0 {
            info!("Breaking out 2");
            break;
          }
          let chunk = &chunk[..len];
          info!("here?");

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

    if let Err(err) = sender_inner.send(CellChannel::Exit) {
      error!("Error while sending exit code: {}", err);
    };
  });

  loop {
    // receive cell channel message
    let received = cell.receiver.recv(); // hangs

    match received {
      Ok(CellChannel::FrontendMessage(FrontendMessage { id: _, action })) => match action {
        Action::Resume => {
          info!("Sending resuming");
          control_flow_sender
            .send(Action::Resume)
            .expect("Failed to send control flow");
        }
        Action::Kill => {
          info!("Killing child");
          let mut child = child.lock().unwrap();
          info!("Unlocked child");
          child.kill().expect("Failed to kill child");
          info!("Killed child");

          let successful = child.wait().expect("Failed to unwrap child").success();
          return Ok(if successful {
            Status::Success
          } else {
            Status::Error
          });
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

#[cfg(not(windows))]
fn get_cmd(command: &str, args: Vec<String>) -> CommandBuilder {
  let mut cmd = CommandBuilder::new("sh");
  cmd.arg("-c");
  cmd.arg(command);
  cmd.args(args);
  cmd
}

#[cfg(windows)]
fn get_cmd(command: &str, args: Vec<String>) -> CommandBuilder {
  let mut cmd = CommandBuilder::new("cmd");
  cmd.arg("/c");
  cmd.arg(command);
  cmd.args(args);
  // not sure we need this:
  // for arg in args {
  //   // Clean the args before we use them:
  //   let arg = arg.replace("|", "\\|");
  //   cmd.arg(&arg);
  // }
  cmd
}

const VERSION: &'static str = env!("CARGO_PKG_VERSION");

static ENVS: &[(&str, &str)] = &[
  ("LANG", "en_US.UTF-8"),
  ("TERM", "xterm-256color"),
  ("COLORTERM", "truecolor"),
  ("TERM_PROGRAM", "Termy"),
  ("TERM_PROGRAM_VERSION", VERSION),
];

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
