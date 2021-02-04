use std::path::{Path, PathBuf};

use crate::shell::{Cell, Data, ServerMessage, Status};
use anyhow::Result;

mod home;
mod shortcuts;
mod theme;
mod view;

#[derive(Debug)]
pub enum Internal {
    Shortcuts,
    Home,
    Theme,
    View,
}

impl Internal {
    pub fn parse(command: &str) -> Option<Self> {
        match command {
            "home" => Some(Self::Home),
            "shortcuts" => Some(Self::Shortcuts),
            "theme" => Some(Self::Theme),
            "view" => Some(Self::View),
            _ => None,
        }
    }

    pub fn mdx(&self, args: Vec<String>, cell: Cell) -> Result<Status> {
        let (mdx, action) = match self {
            Self::Shortcuts => (shortcuts::shortcuts(), None),
            Self::Home => (home::home(), None),
            Self::Theme => theme::theme(args),
            Self::View => (
                view::view(find_path(
                    cell.current_dir(),
                    args.into_iter().next().unwrap(),
                ))?,
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

fn find_path(current_dir: &str, path: String) -> Option<PathBuf> {
    if Path::new(&path).exists() {
        Some(PathBuf::from(path))
    } else if Path::new(current_dir).join(&path).exists() {
        Some(Path::new(current_dir).join(path))
    } else {
        None
    }
}
