use crate::cross_path::CrossPath;
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
    return Ok(format!("<Path>{}</Path> is not a file", path));
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
mod tests {}
