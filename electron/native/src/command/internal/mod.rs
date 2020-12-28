use crate::cell::{Cell, Data, ServerMessage, Status};
use anyhow::Result;

mod home;
mod shortcuts;
mod theme;

#[derive(Debug)]
pub enum Internal {
    Shortcuts,
    Home,
    Theme,
}

impl Internal {
    pub fn parse(command: &str) -> Option<Self> {
        match command {
            "home" => Some(Self::Home),
            "shortcuts" => Some(Self::Shortcuts),
            "theme" => Some(Self::Theme),
            _ => None,
        }
    }

    pub fn mdx(&self, args: Vec<String>, cell: Cell) -> Result<Status> {
        let (mdx, action) = match self {
            Self::Shortcuts => (shortcuts::shortcuts(), None),
            Self::Home => (home::home(), None),
            Self::Theme => theme::theme(args),
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

// "move" => {
//     // move arg1 arg2
//     let mut args = self.args.iter();
//     let from = self.current_dir.clone() + args.next().unwrap();
//     let from = Path::new(&from);
//     let to = self.current_dir.clone() + args.next().unwrap();
//     let to = Path::new(&to);
//     from.canonicalize()?;
//     fs::rename(from, to)?;
//     ServerMessage::api("Moved file".to_owned(), None, Status::Success)
// }
