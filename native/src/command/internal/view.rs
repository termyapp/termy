use anyhow::Result;
use std::{fs, path::Path};

pub fn view<P: AsRef<Path>>(path: Option<P>) -> Result<String> {
  if let Some(path) = path {
    let extension = path.as_ref().extension().unwrap_or_default();
    let content = fs::read_to_string(&path)?;

    return Ok(format!(
      "```{}\n{}\n```",
      extension.to_string_lossy(),
      content
    ));
  } else {
    let message = format!("Path does not exist");
    return Ok(message);
  }
}

#[cfg(test)]
mod tests {
  use crate::paths::test_dir;

  use super::*;

  #[test]
  fn reads_file() {
    let file = test_dir().unwrap().join("test.txt");

    assert_eq!(view(Some(file)).unwrap(), "```txt\nTest\n```".to_string());
  }
}
