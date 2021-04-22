use crate::{
  cell::{command::Command, Message},
  util::error::{Result, TermyError},
};
use serde_json::json;
use std::fs;

impl Command {
  pub fn edit(&self) -> Result<Vec<Message>> {
    match self.find_first_path() {
      Ok(path) => {
        if path.buf.is_file() {
          let language = path
            .buf
            .extension()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default();
          let content = fs::read_to_string(&path.buf).unwrap_or_default();

          let value = json!({
            "type": "edit",
            "props": {
              "content": content,
              "path": path.to_string(),
              "language": language,
            }
          });

          Ok(vec![Message::component(value)])
        } else {
          return Err(TermyError::NotFile(path.to_string()));
        }
      }
      Err(err) => Err(err),
    }
  }
}
