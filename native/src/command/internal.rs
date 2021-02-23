use crate::{
  paths::CrossPath,
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
}

impl Internal {
  pub fn parse(command: &str) -> Option<Self> {
    match command {
      "home" => Some(Self::Home),
      "shortcuts" => Some(Self::Shortcuts),
      "theme" => Some(Self::Theme),
      "view" => Some(Self::View),
      "edit" => Some(Self::Edit),
      _ => None,
    }
  }

  pub fn mdx(&self, args: Vec<String>, cell: Cell) -> Result<Status> {
    let (mdx, action) = match self {
      Self::Shortcuts => (shortcuts::shortcuts(), None),
      Self::Home => (home::home(), None),
      Self::Theme => theme::theme(args),
      Self::View => (
        if let Some(path) = find_path(cell.current_dir(), args.into_iter().next().unwrap()) {
          view::view(path)?
        } else {
          format!("Path does not exist")
        },
        None,
      ),
      Self::Edit => (
        if let Some(path) = find_path(cell.current_dir(), args.into_iter().next().unwrap()) {
          edit::edit(path)?
        } else {
          format!("Path does not exist")
        },
        None,
      ),
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

fn find_path(current_dir: &str, path: String) -> Option<CrossPath> {
  let cross_path = CrossPath::new(&path);
  let current_dir = CrossPath::new(current_dir);
  if current_dir.join(&path).buf.exists() {
    Some(current_dir.join(path))
  } else if cross_path.buf.exists() {
    Some(cross_path)
  } else {
    None
  }
}
