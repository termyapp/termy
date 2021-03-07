use crate::{
  cross_path::CrossPath,
  shell::{Cell, Data, ServerMessage, Status},
};
use anyhow::Result;

mod edit;
mod home;
mod shortcuts;
mod theme;
pub mod view;

#[derive(Debug)]
pub enum Internal {
  Shortcuts,
  Home,
  Theme,
  View,
  Edit,
  Cd,
}

impl Internal {
  pub fn parse(command: &str) -> Option<Self> {
    match command {
      "home" => Some(Self::Home),
      "shortcuts" => Some(Self::Shortcuts),
      "theme" => Some(Self::Theme),
      "view" => Some(Self::View),
      "edit" => Some(Self::Edit),
      "cd" => Some(Self::Cd),
      _ => None,
    }
  }

  pub fn mdx(&self, args: Vec<String>, cell: Cell) -> Result<Status> {
    let (mdx, action) = match self {
      Self::Shortcuts => (shortcuts::shortcuts(), None),
      Self::Home => (home::home(), None),
      Self::Theme => theme::theme(args),
      Self::View => (
        if let Some(path) =
          CrossPath::new(cell.current_dir()).find_path(&args.into_iter().next().unwrap())
        {
          view::view(&path)?
        } else {
          format!("Path does not exist")
        },
        None,
      ),
      Self::Edit => (
        if let Some(path) =
          CrossPath::new(cell.current_dir()).find_path(&args.into_iter().next().unwrap())
        {
          edit::edit(path)?
        } else {
          format!("Path does not exist")
        },
        None,
      ),
      Self::Cd => {
        if let Some(mut path) =
          CrossPath::new(cell.current_dir()).find_path(&args.into_iter().next().unwrap())
        {
          path.canonicalize();
          (
            view::view(&path)?,
            Some(vec![
              (String::from("cd"), path.to_string()),
              (String::from("pretty_path"), path.pretty_path()),
              (String::from("branch"), path.branch().unwrap_or_default()),
            ]),
          )
        } else {
          (format!("Path does not exist"), None)
        }
      }
    };

    cell.send(ServerMessage::new(Data::Mdx(mdx), action));

    Ok(Status::Success)
  }

  pub fn api(&self) -> String {
    match self {
      Self::Shortcuts => shortcuts::shortcuts(),
      Self::Home => home::home(),
      _ => todo!(),
    }
  }
}
