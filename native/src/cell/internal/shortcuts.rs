use crate::cell::{command::Command, Message};
use crate::util::error::Result;

const SHORTCUTS: &str =
  "[Keyboard Shortcuts on GitHub](https://github.com/TermyApp/termy#keyboard-shortcuts)";

impl Command {
  pub fn shortcuts(&self) -> Result<Vec<Message>> {
    Ok(vec![Message::markdown(SHORTCUTS.to_string())])
  }
}
