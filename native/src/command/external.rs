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
  let mut pair = pty_system.openpty(PtySize {
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

  // Read an from the pty with reader
  let mut reader = pair.master.try_clone_reader()?;

  let tsfn_clone = cell
    .tsfn
    .try_clone()
    .expect("Failed to clone threadsafe function");
  let sender_clone = cell.sender.clone();

  let (flow_sender, flow_receiver) = unbounded::<FlowControl>();

  thread::spawn(move || {
    // Stop-and-wait type flow control works fine here
    // since message passing time is negligible
    // https://en.wikipedia.org/wiki/Flow_control_(data)
    // https://xtermjs.org/docs/guides/flowcontrol/
    let mut paused = false;
    let mut chunk = [0u8; 1024];

    loop {
      if paused {
        if let Ok(FlowControl::Resume) = flow_receiver.recv() {
          paused = false;
          continue;
        } else {
          error!("Error receiving in flow channel");
        }
      } else {
        paused = true;

        let read = reader.read(&mut chunk);

        if let Ok(len) = read {
          if len == 0 {
            // todo: doesn't get here on windows
            break;
          }
          let chunk = &chunk[..len];

          info!("Sending chunk with length: {}", chunk.len());
          // let data = ServerData::PtyData(chunk.to_vec());
          tsfn_send(
            &tsfn_clone,
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
      Ok(CellChannel::FrontendMessage(FrontendMessage {
        id,
        stdin,
        size,
        flow_control,
      })) => {
        if let Some(flow_control) = flow_control {
          if let Ok(()) = flow_sender.send(flow_control) {
            info!("Sent flow control");
          } else {
            error!("Failed to send flow control");
          }
        } else if let Some(message) = stdin {
          // Send data to the pty by writing to the master
          write!(pair.master, "{}", message).expect("Failed to write to master");
          info!("Stdin written: {:?}", message);
        } else if let Some(Size { rows, cols }) = size {
          pair
            .master
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

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
enum FlowControl {
  Resume,
  Pause, // currently not used
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrontendMessage {
  id: String,
  stdin: Option<String>,
  size: Option<Size>,
  flow_control: Option<FlowControl>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Size {
  rows: u16,
  cols: u16,
}
