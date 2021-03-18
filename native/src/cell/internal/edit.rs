use crate::{
  cell::{command::Command, Component, ComponentKind, Message},
  util::error::{Result, TermyError},
};
use std::{collections::HashMap, fs};

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

          let mut props: HashMap<String, String> = HashMap::new();
          props.insert("content".to_string(), content);
          props.insert("path".to_string(), path.to_string());
          props.insert("language".to_string(), language.to_string());

          Ok(vec![Message::Component(Component {
            kind: ComponentKind::Edit,
            props,
          })])
        } else {
          return Err(TermyError::NotFile(path.to_string()));
        }
      }
      Err(err) => Err(err),
    }
  }
}

struct Props {
  content: String,
  path: String,
  language: String,
}
