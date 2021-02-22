use crate::shell::{tsfn_send, Cell, CellChannel, Data, ServerMessage, Status};
use anyhow::{Context, Result};
use crossbeam_channel::unbounded;
use io::Read;
use log::{error, info, trace};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::Deserialize;
use std::thread;
use std::{
  io,
  sync::{Arc, Mutex},
};
use std::{io::Write, time::Duration};

pub fn external(command: &str, args: Vec<String>, cell: Cell) -> Result<Status> {
  info!("Running external command: {:#?}", command);
  let pair = {
    let pty = native_pty_system();
    pty
      .openpty(PtySize::default())
      .with_context(|| "could not open pty")?
  };

  let cmd = get_cmd(command, args, cell.current_dir());

  let child = Arc::new(Mutex::new(pair.slave.spawn_command(cmd)?));
  let child_inner = Arc::clone(&child);
  let mut master = pair.master;
  let mut reader = master.try_clone_reader()?;
  let mut reader_inner = master.try_clone_reader()?;

  let tsfn = cell.clone_tsfn();
  let tsfn_inner = cell.clone_tsfn();
  let sender_inner = cell.sender.clone();
  let sender_inner2 = cell.sender.clone();
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
      trace!("Start of loop");

      if paused {
        // blocks thread
        if let Ok(Action::Resume) = control_flow_receiver.recv() {
          trace!("Resuming");
          paused = false;
        } else {
          error!("Failed to receive control flow action");
        }
      } else {
        paused = true;

        let len = match reader_inner.read(&mut chunk) {
          Ok(0) => {
            trace!("Last read");
            break;
          }
          Ok(read) => read,
          Err(err) => {
            error!("Error while reading: {}", err);
            break;
          }
        };

        tsfn_send(
          &tsfn_inner,
          ServerMessage::new(Data::Text(chunk[..len].to_vec()), None),
        );
      }
    }

    if let Err(err) = sender_inner.send(CellChannel::Exit) {
      error!("Error while sending exit code: {}", err);
    };
  });

  // unfortunately reading the last chunk hangs on windows
  // https://github.com/wez/wezterm/issues/463
  // we don't know when to drop master, but we need it to write/resize
  // hopefull we'll have a better way in the future
  #[cfg(windows)]
  thread::spawn(move || loop {
    thread::sleep(Duration::from_millis(50));
    if (*child_inner.lock().expect("Failed to lock child"))
      .try_wait()
      .expect("Failed to poll child")
      .is_some()
    {
      trace!("Breaking out");
      if let Err(err) = sender_inner2.send(CellChannel::Exit) {
        error!("Error while sending exit code: {}", err);
      };
      break;
    } else {
      info!("Not yet over");
    }
  });

  loop {
    // receive cell channel message
    let received = cell.receiver.recv(); // hangs

    match received {
      Ok(CellChannel::FrontendMessage(FrontendMessage { id: _, action })) => match action {
        Action::Resume => {
          info!("Sending resume");
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
        }
        Action::Write(data) => {
          info!("Writing data: {:?}", data);
          master.write_all(data.as_bytes())?;
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

fn get_cmd(command: &str, args: Vec<String>, current_dir: &str) -> CommandBuilder {
  let mut cmd = {
    #[cfg(not(windows))]
    {
      let mut cmd = CommandBuilder::new("sh");
      cmd.arg("-c");
      cmd
    }

    #[cfg(windows)]
    {
      let mut cmd = CommandBuilder::new("cmd");
      cmd.arg("/c");
      // not sure we need this:
      // for arg in args {
      //   // Clean the args before we use them:
      //   let arg = arg.replace("|", "\\|");
      //   cmd.arg(&arg);
      // }
      cmd
    }
  };

  cmd.arg(vec![command.to_string(), args.join(" ")].join(" "));
  cmd.cwd(current_dir);
  for (key, val) in ENVS.iter() {
    cmd.env(key, val);
  }

  trace!("{:?}", cmd);
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
