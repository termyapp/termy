use crate::paths::CrossPath;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;

pub fn edit(path: CrossPath) -> Result<String> {
  if path.buf.is_file() {
    let language = path
      .buf
      .extension()
      .unwrap_or_default()
      .to_str()
      .unwrap_or_default();
    let mut content = fs::read_to_string(&path.buf)?;
    content = base64::encode(content);

    return Ok(format!(
      "<Edit value=\"{}\" path=\"{}\" language=\"{}\" />",
      content, path, language
    ));
  } else {
    return Ok(format!(
      "
      ### Error
      <Path>{}</Path> is not a file
      ",
      path
    ));
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
  use crate::paths::test_dir;

  use super::*;

  #[test]
  fn reads_file() {
    let test = test_dir().unwrap().join("test.txt");
    let test = test.to_str().unwrap();
    assert_eq!(
      view(CrossPath::new(test)).unwrap(),
      "```txt\nTest\n```".to_string()
    );
  }
}
