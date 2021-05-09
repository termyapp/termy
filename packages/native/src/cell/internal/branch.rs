use crate::{
  cell::{command::Command, Message},
  util::cross_path::CrossPath,
  util::error::Result,
};

impl Command {
  pub fn branch(&self) -> Result<Vec<Message>> {
    let branch = CrossPath::new(&self.cell.current_dir)
      .branch()
      .unwrap_or_default();
    Ok(vec![Message(branch)])
  }
}
