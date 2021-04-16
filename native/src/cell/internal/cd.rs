use crate::{
  cell::{command::Command, Action, Message},
  util::error::Result,
  util::error::TermyError,
};
use log::info;

impl Command {
  pub fn cd(&self) -> Result<Vec<Message>> {
    match self.find_first_path() {
      Ok(mut path) => {
        // check if path is a directory
        if path.buf.is_dir() {
          info!("Changing directory to {}", path);

          path.canonicalize();
          let mut messages = self.view().unwrap_or_default();
          messages.push(Message::action(Action::Cd(path.to_string())));
          Ok(messages)
        } else {
          Err(TermyError::NotDirectory(path.to_string()))
        }
      }
      Err(err) => Err(err),
    }
  }
}
