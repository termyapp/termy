use crate::{
    cell::{tsfn_send, Cell, ServerMessage, Status},
    util::get_executables,
};
use anyhow::{bail, Result};
use internal::Internal;
use serde::{Deserialize, Serialize};
use std::path::Path;

pub mod external;
pub mod internal;

#[derive(Debug)]
pub struct Command {
    kind: Kind,
    args: Vec<String>,
}

#[derive(Debug)]
enum Kind {
    Path(String),
    Internal(Internal),
    External(String),
    NotFound,
}

impl Command {
    pub fn new(command: String, args: Vec<String>, current_dir: &str) -> Self {
        Self {
            kind: match command.as_str() {
                path if Path::new(current_dir).join(path).exists() || Path::new(path).exists() => {
                    Kind::Path(command)
                }
                internal if Internal::parse(internal).is_some() => {
                    Kind::Internal(Internal::parse(internal).unwrap())
                }
                str if get_executables().contains(&command) => Kind::External(command),
                _ => Kind::NotFound,
            },
            args,
        }
    }

    pub fn execute(self, cell: Cell) -> Result<()> {
        let tsfn_clone = cell.tsfn.try_clone()?;

        let status: Result<Status> = match &self.kind {
            Kind::Path(path) => todo!(),
            Kind::Internal(internal) => internal.cell(cell),
            Kind::External(command) => external::external(command, self.args, cell),
            Kind::NotFound => Ok(Status::Error),
        };

        tsfn_send(
            &tsfn_clone,
            ServerMessage::Status(status.unwrap_or(Status::Error)),
        );

        Ok(())
    }
}
