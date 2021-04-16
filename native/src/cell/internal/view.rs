use crate::cell::{command::Command, Message};
use crate::util::error::Result;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;

pub struct View;

impl Command {
  pub fn view(&self) -> Result<Vec<Message>> {
    match self.find_first_path() {
      Ok(path) => {
        // check if path is a directory
        if path.buf.is_dir() {
          // construct dir contents table
          let dir = fs::read_dir(&path.buf).unwrap();
          let json: Vec<Entry> = dir
            .map(|entry| {
              let entry = entry.unwrap();
              Entry {
                name: entry.file_name().to_string_lossy().to_string(),
                kind: if entry.metadata().unwrap().is_dir() {
                  Kind::Directory
                } else {
                  Kind::File
                },
              }
            })
            .collect();

          if json.len() == 0 {
            return Ok(vec![Message::markdown("Folder is empty".to_string())]);
          }

          let value = json!({
            "kind": "table",
            "props": {
              "json": serde_json::to_string(&json).unwrap()
            }
          });

          Ok(vec![Message::from_value(value)])
        } else if path.buf.is_file() {
          // read file
          let extension = path.buf.extension().unwrap_or_default();
          let content = fs::read_to_string(&path.buf).unwrap_or_default();

          Ok(vec![Message::markdown(format!(
            "```{}\n{}\n```",
            extension.to_string_lossy(),
            content
          ))])
        } else {
          Ok(vec![Message::markdown(
            "Path is not a directory or a file".to_string(),
          )])
        }
      }
      Err(err) => Err(err),
    }
  }
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Entry {
  name: String,
  #[serde(rename = "type")]
  kind: Kind,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
enum Kind {
  Directory,
  File,
}

#[cfg(test)]
mod tests {
  // use super::*;
  // use crate::util::dirs::test_dir;

  #[test]
  fn reads_file() {
    // todo: write tests
    // let test = test_dir().join("test.txt");
  }
}
