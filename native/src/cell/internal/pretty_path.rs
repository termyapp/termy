use crate::{
  cell::{command::Command, Message},
  util::cross_path::CrossPath,
  util::error::Result,
};

impl Command {
  pub fn pretty_path(&self) -> Result<Vec<Message>> {
    let pretty = CrossPath::new(&self.cell.current_dir).pretty_path();
    Ok(vec![Message(pretty)])
  }
}
