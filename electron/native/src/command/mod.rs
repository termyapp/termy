use crate::{
    cell::{tsfn_send, Cell, ServerMessage, Status},
    util::get_executables,
};
use anyhow::Result;
use internal::Internal;
use log::info;
use std::{
    ffi::OsString,
    path::{Path, PathBuf},
};

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
    Path(PathBuf),
    Internal(Internal),
    External(String),
    NotFound,
}

impl Command {
    pub fn new(command: String, args: Vec<String>, current_dir: &str) -> Self {
        Self {
            kind: match command.as_str() {
                path if Path::new(current_dir).join(path).exists() => {
                    Kind::Path(Path::new(current_dir).join(path))
                }
                path if Path::new(path).exists() => Kind::Path(PathBuf::from(path)),
                "cd" => {
                    // get new directory from args
                    // if it fails, set home dir as the default
                    let path = if let Some(path) = args.iter().next() {
                        if Path::new(current_dir).join(path).exists() {
                            Path::new(current_dir).join(path)
                        } else {
                            PathBuf::from(path)
                        }
                    } else {
                        dirs::home_dir().unwrap()
                    };

                    info!("set path to {:?}", path);
                    Kind::Path(path)
                }
                internal if Internal::parse(internal).is_some() => {
                    Kind::Internal(Internal::parse(internal).unwrap())
                }
                _ if get_executables().contains(&command) => Kind::External(command),
                _ => Kind::NotFound,
            },
            args,
        }
    }

    pub fn execute(self, cell: Cell) -> Result<()> {
        let tsfn_clone = cell.tsfn.try_clone()?;

        let status: Result<Status> = match &self.kind {
            Kind::Path(path) => path::path(path, cell),
            Kind::Internal(internal) => internal.mdx(self.args, cell),
            Kind::External(command) => external::external(command, self.args, cell),
            Kind::NotFound => Ok(Status::Error),
        };

        tsfn_send(
            &tsfn_clone,
            ServerMessage::status(status.unwrap_or(Status::Error)),
        );

        Ok(())
    }
}
