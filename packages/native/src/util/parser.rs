use super::cross_path::CrossPath;

// this could become shell.rs

pub fn expand_alias(string: String) -> String {
  // ~ -> $HOME
  if string == "~" || string.starts_with("~/") {
    string.replace("~", &(CrossPath::home().to_string()))
  } else {
    string
  }
}

pub fn tokenize_value(value: &str) -> Vec<String> {
  let mut inside_quotes = false;
  let mut tokens: Vec<String> = vec![];
  let mut token = String::new();

  for (i, c) in value.chars().enumerate() {
    if c == '"'
      && value
        .chars()
        .nth(if i > 0 { i - 1 } else { 0 })
        .unwrap_or_default()
        != '\\'
    {
      inside_quotes = !inside_quotes;
    } else if c.is_whitespace() && !inside_quotes {
      tokens.push(token.clone());
      token.clear();
    } else {
      token.push(c);
    }
  }
  tokens.push(token);

  tokens
}

#[cfg(test)]
mod tests {
  use super::*;
  use log::info;

  #[test]
  fn expands_alias() {
    assert_eq!(expand_alias("~".to_string()), CrossPath::home().to_string());
    assert_eq!(
      expand_alias("~/123".to_string()),
      CrossPath::home().join("123").to_string()
    );
    assert_eq!(expand_alias("HEAD~".to_string()), "HEAD~".to_string());
  }

  #[test]
  fn tokenizes_value() {
    assert_eq!(
      tokenize_value("command arg1 arg2"),
      vec![
        "command".to_string(),
        "arg1".to_string(),
        "arg2".to_string(),
      ]
    );

    assert_eq!(
      tokenize_value("\"create\" \"Whitespace inside quotes yay'\""),
      vec![
        "create".to_string(),
        "Whitespace inside quotes yay'".to_string()
      ]
    );

    assert_eq!(
      tokenize_value("diskutil \"\"WIN10\"\""),
      vec!["diskutil".to_string(), "WIN10".to_string()]
    );

    info!("back\\\"slash doesnt't break it");

    assert_eq!(
      tokenize_value("escaped \"back\\\"slash\" \"doesn't break it\""),
      vec![
        "escaped".to_string(),
        "back\\\"slash".to_string(),
        "doesn't break it".to_string()
      ]
    );

    assert_eq!(tokenize_value("\""), vec!["".to_string()]);
    assert_eq!(tokenize_value(""), vec!["".to_string()]);
  }
}
