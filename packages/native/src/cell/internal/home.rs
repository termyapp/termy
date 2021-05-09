use crate::{
  cell::{command::Command, Message},
  util::cross_path::CrossPath,
  util::error::Result,
};

impl Command {
  pub fn home(&self) -> Result<Vec<Message>> {
    Ok(vec![Message(CrossPath::home().to_string())])
  }
}

#[cfg(test)]
mod tests {
  // use super::*;

  #[test]
  fn home_not_empty() {}
}
