use crate::suggestions::executables::EXECUTABLES;
use crate::{
  shell::{tsfn_send, Cell, ServerMessage, Status},
  util::cross_path::CrossPath,
};
use anyhow::Result;
use internal::Internal;

pub mod external;
pub mod internal;
mod path;

#[derive(Debug)]
pub struct Command {
  pub kind: Kind,
  args: Vec<String>,
}

#[derive(Debug)]
pub enum Kind {
  Path(CrossPath),
  Internal(Internal),
  External(String),
  NotFound,
}

impl Command {
  pub fn new(command: String, args: Vec<String>, current_dir: &str) -> Self {
    let current_path = CrossPath::new(current_dir);
    Self {
      kind: match command.as_str() {
        path if current_path.find_path(path).is_some() => {
          let cross_path = current_path.find_path(path).unwrap();
          if path.starts_with("./") {
            // executable
            Kind::External(path.to_string())
          } else {
            Kind::Path(cross_path)
          }
        }
        internal if Internal::parse(internal).is_some() => {
          Kind::Internal(Internal::parse(internal).unwrap())
        }
        _ if EXECUTABLES.contains(&command)
          || (cfg!(windows) && EXECUTABLES.contains(&command.to_lowercase())) =>
        {
          Kind::External(command)
        }
        _ => Kind::NotFound,
      },
      args,
    }
  }

  pub fn execute(self, cell: Cell) -> Result<()> {
    let tsfn_clone = cell.tsfn.try_clone()?;

    let status: Result<Status> = match self.kind {
      Kind::Path(path) => path::path(path, cell),
      Kind::Internal(internal) => internal.mdx(self.args, cell),
      Kind::External(command) => external::external(&command, self.args, cell),
      Kind::NotFound => Ok(Status::Error),
    };

    tsfn_send(
      &tsfn_clone,
      ServerMessage::status(status.unwrap_or(Status::Error)),
    );

    Ok(())
  }
}
