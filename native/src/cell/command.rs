use super::{external::External, Cell, Message};
use crate::{suggestions::executables::EXECUTABLES, util::cross_path::CrossPath};
use crate::{
  util::error::{Result, TermyError},
  util::parser::{expand_alias, tokenize_value},
};

pub struct Command {
  pub cell: Cell,
  pub kind: Kind,
  pub args: Vec<String>,
}

#[derive(Clone)]
pub enum Kind {
  Cd,
  View,
  Home,
  Shortcuts,
  Theme,
  Edit,
  External(External),
  NotFound,
}

impl Command {
  pub fn new(cell: Cell) -> Self {
    let current_path = CrossPath::new(&cell.current_dir);

    let mut args: Vec<String> = tokenize_value(&cell.value)
      .into_iter()
      .map(expand_alias)
      .collect();
    let command = args.remove(0);
    let args_iter = args.clone().into_iter();

    Self {
      cell,
      kind: match command.as_str() {
        "cd" => Kind::Cd,
        "view" => Kind::View,
        "home" => Kind::Home,
        "shortcuts" => Kind::Shortcuts,
        "theme" => Kind::Theme,
        "edit" => Kind::Edit,
        path if current_path.find_path(path).is_some() => {
          let cross_path = current_path.find_path(path).unwrap();
          if path.starts_with("./") {
            // executable (eg. ./scripts/build.sh)
            Kind::External(External(path.to_string()))
          } else if cross_path.buf.is_dir() {
            // if path is a directory we run `cd` by default
            Kind::Cd
          } else {
            // if path is a file we run `view` by default
            Kind::View
          }
        }
        external if EXECUTABLES.contains(&external) => Kind::External(External(command)),
        _ => Kind::NotFound,
      },
      args,
    }
  }

  pub fn match_internal(&self) -> Result<Vec<Message>> {
    match self.kind {
      Kind::Cd => self.cd(),
      Kind::View => self.view(),
      Kind::Home => self.home(),
      Kind::Shortcuts => self.shortcuts(),
      Kind::Theme => self.theme(),
      Kind::Edit => self.edit(),
      _ => panic!("Kind should be internal"),
    }
  }

  pub fn find_first_path(&self) -> Result<CrossPath> {
    // get first arg
    if let Some(arg) = self.args.iter().next() {
      // check if arg is a valid path
      if let Some(path) = CrossPath::new(&self.cell.current_dir).find_path(&arg) {
        Ok(path)
      } else {
        Err(TermyError::InvalidPath(arg.to_string()))
      }
    } else {
      Err(TermyError::InvalidArgument)
    }
  }
}
