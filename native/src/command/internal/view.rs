use crate::util::cross_path::CrossPath;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;

pub fn view(path: &CrossPath) -> Result<String> {
  if path.buf.is_dir() {
    let dir = fs::read_dir(&path.buf)?;
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
      return Ok(format!("Folder is empty"));
    }

    let json = serde_json::to_string(&json).unwrap();
    Ok(format!("<Table json=\"{}\" />", base64::encode(json)))
  } else if path.buf.is_file() {
    let extension = path.buf.extension().unwrap_or_default();
    let content = fs::read_to_string(&path.buf)?;

    return Ok(format!(
      "```{}\n{}\n```",
      extension.to_string_lossy(),
      content
    ));
  } else {
    todo!()
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
  use crate::util::dirs::test_dir;

  use super::*;

  #[test]
  fn reads_file() {
    let test = test_dir().join("test.txt");
    let test = test.to_str().unwrap();
    assert_eq!(
      view(&CrossPath::new(test)).unwrap(),
      "```txt\nTest\n```".to_string()
    );
  }
}
