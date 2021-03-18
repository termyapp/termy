use self::channel::Channel;
use crate::util::error::Result;
use command::{Command, Kind};
use log::info;
use serde::{Deserialize, Serialize};
use std::{borrow::Borrow, collections::HashMap};

pub mod channel;
pub mod command;
pub mod external;
pub mod internal;

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Cell {
  pub id: String,
  pub current_dir: String,
  pub value: String,
}

impl Cell {
  pub fn api(self) -> Result<Vec<Message>> {
    let command = Command::new(self);

    let data: Result<Vec<Message>> = match command.kind.clone() {
      Kind::External(command) => {
        todo!();
      }
      Kind::NotFound => {
        todo!();
      }
      _internal => command.match_internal(),
    };

    data
  }

  pub fn run(self, channel: Channel) -> Result<()> {
    let tsfn = channel.tsfn.clone();
    let command = Command::new(self);

    info!("Running cell: {:?}", command.cell);

    // todo: once operators (|, &&, ||) are introduced, this could become Vec<Command>

    let status: anyhow::Result<Status> = match command.kind.clone() {
      Kind::NotFound => Ok(Status::Error),
      Kind::External(external) => external.run(command, channel),
      _internal => match command.match_internal() {
        Ok(message) => {
          tsfn.send(message);
          Ok(Status::Success)
        }
        Err(err) => {
          tsfn.send_one(Message::Markdown(format!("Error: {}", err)));
          Ok(Status::Error)
        }
      },
    };

    info!("Cell status: {:?}", status);

    tsfn.send_one(Message::Status(status.unwrap_or(Status::Error)));

    // todo: record

    Ok(())
  }

  // fn record_command(&self, cell: Cell) -> Result<()> {
  //   match &self.kind {
  //     Kind::Internal(Internal::Cd(path)) => {
  //       // todo: append to visited paths
  //     }
  //     Kind::Internal(_) | Kind::External(_) => {
  //       match HISTORY.lock() {
  //         Ok(mut history) => {
  //           // append to history
  //           history.add(cell.current_dir.clone(), cell.value.clone());
  //         }
  //         Err(err) => {
  //           error!("Failed to lock HISTORY: {}", err);
  //         }
  //       }
  //     }
  //     _ => {}
  //   }

  //   Ok(())
  // }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Message {
  Status(Status),
  Action(Action),
  Tui(Vec<u8>),
  Markdown(String),
  Component(Component),
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Status {
  Running,
  Success,
  Error,
}

#[derive(Serialize, Debug)]
pub enum Action {
  Cd(String),
  Theme(String),
}

#[derive(Serialize)]
struct Component {
  kind: ComponentKind,
  props: HashMap<String, String>,
}

#[derive(Serialize)]
enum ComponentKind {
  Table,
  Edit,
  Path,
}
