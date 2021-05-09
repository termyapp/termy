use self::channel::Channel;
use crate::suggestions::history::HISTORY;
use crate::util::error::Result;
use command::{Command, Kind};
use log::{error, info};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

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

    info!("Returning API data: {:#?}", data);

    data
  }

  pub fn run(self, channel: Channel) -> Result<()> {
    let tsfn = channel.tsfn.clone();
    // todo: once operators (|, &&, ||) are introduced, this could become Vec<Command>
    let command = Command::new(self.clone());
    let kind = command.kind.clone();

    info!("Running cell: {:?}", command.cell);
    tsfn.send_one(Message::status(Status::Running));

    let status: anyhow::Result<Status> = match &kind {
      Kind::NotFound => Ok(Status::Error),
      Kind::External(external) => external.run(command, channel),
      _internal => match command.match_internal() {
        Ok(message) => {
          tsfn.send(message);
          Ok(Status::Success)
        }
        Err(err) => {
          tsfn.send_one(Message::markdown(format!("Error: {}", err)));
          Ok(Status::Error)
        }
      },
    };

    info!("Cell status: {:?}", status);

    let status = status.unwrap_or(Status::Error);

    if let Status::Success = status {
      if let Err(err) = self.record_command(kind) {
        error!("Error recording command: {:?}", err);
      }
    }

    tsfn.send_one(Message::status(status));

    Ok(())
  }

  fn record_command(&self, kind: Kind) -> Result<()> {
    match kind {
      Kind::NotFound => {}
      Kind::Cd => {
        // todo: append cd to visited paths
      }
      _ => {
        match HISTORY.lock() {
          Ok(mut history) => {
            // append to history
            history.add(self.current_dir.clone(), self.value.clone());
          }
          Err(err) => {
            error!("Failed to lock HISTORY: {}", err);
          }
        }
      }
      _ => {}
    }

    Ok(())
  }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Message(String);

impl Message {
  pub fn component(value: Value) -> Message {
    let component = json!({ "component": value });
    Message(component.to_string())
  }

  pub fn markdown(content: String) -> Message {
    let data = json!({ "component": { "type": "markdown", "props": { "children": content } } });
    Message(data.to_string())
  }

  pub fn status(status: Status) -> Message {
    let data = json!({ "status": status });
    Message(data.to_string())
  }

  pub fn action(action: Action) -> Message {
    let data = json!({ "action": action });
    Message(data.to_string())
  }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Status {
  Running,
  Success,
  Error,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Action {
  Cd(String),
  Theme(String),
}
