use crate::{
  paths::CrossPath,
  shell::{tsfn_send, Cell, ServerMessage, Status},
  util::executables::EXECUTABLES,
};
use anyhow::Result;
use internal::Internal;

pub mod external;
pub mod internal;
mod path;

#[derive(Debug)]
pub struct Command {
  kind: Kind,
  args: Vec<String>,
}

#[derive(Debug)]
enum Kind {
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
        // relative path (eg. /Users/martonlanga + dev)
        path if current_path.join(path).buf.exists() && !path.starts_with("./") => {
          Kind::Path(current_path.join(path))
        }
        // executable (eg. /Users/martonlanga + ./script.sh)
        path if current_path.join(path).buf.exists() && path.starts_with("./") => {
          Kind::External(current_path.join(path).to_string())
        }
        // absolute path (eg. /Volumes)
        path if CrossPath::new(path).buf.exists() => Kind::Path(current_path),
        // "cd" => {
        //   // get new directory from args
        //   // if it fails, set home dir as the default
        //   let path = if let Some(path) = args.iter().next() {
        //     if current_path.buf.join(path).exists() {
        //       current_path.buf.join(path)
        //     } else {
        //       PathBuf::from(path)
        //     }
        //   } else {
        //     dirs::home_dir().unwrap()
        //   };

        //   info!("set path to {:?}", path);
        //   Kind::Path(path)
        // }
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
