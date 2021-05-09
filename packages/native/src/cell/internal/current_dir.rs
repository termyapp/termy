use crate::{
  cell::{command::Command, Message},
  util::cross_path::CrossPath,
  util::error::Result,
};

impl Command {
  pub fn current_dir(&self) -> Result<Vec<Message>> {
    if self.args.iter().any(|arg| arg == "--short" || arg == "-s") {
      let pretty = CrossPath::new(&self.cell.current_dir).pretty_path();
      Ok(vec![Message(pretty)])
    } else {
      Ok(vec![Message(self.cell.current_dir.clone())])
    }
  }
}
