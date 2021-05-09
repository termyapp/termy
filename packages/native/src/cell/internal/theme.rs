use crate::cell::{command::Command, Action, Message};
use crate::util::error::{Result, TermyError};

impl Command {
  pub fn theme(&self) -> Result<Vec<Message>> {
    if let Some(theme) = self.args.iter().next() {
      match theme.as_str() {
        "#000" | "#fff" => Ok(vec![
          Message::markdown(format!("Changed theme to {}", theme)),
          Message::action(Action::Theme(theme.to_string())),
        ]),
        _ => Err(TermyError::InvalidTheme(theme.to_string())),
      }
    } else {
      Err(TermyError::InvalidArgument)
    }
  }
}
