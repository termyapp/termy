use super::{ProviderState, Suggestion, SuggestionProvider, SuggestionType};
use crate::shell::expand_alias;
use crate::{shell::tokenize_value, util::cross_path::CrossPath};
use anyhow::Result;
use std::{fs, path::Path, time::UNIX_EPOCH};
pub struct Paths;

// todo: visited paths
// if &current_dir.to_string() == &path.to_string() {
// don't suggest current directory
// continue;
// if let Some(path) = diff_paths(
//   CrossPath::new(&entry.current_dir).join(&entry.value),
//   &state.current_dir,
// ) {
//   info!("Found path {:?}", path);
//   let absolute_path = CrossPath::new(&state.current_dir).join(&path);
//   if absolute_path.buf.exists() {
//     label = path.to_str().unwrap_or_default().to_owned();
//     key = label.clone();
//   } else {
//     continue;
//   }
// }

impl SuggestionProvider for Paths {
  fn suggestions(&self, state: &mut ProviderState) -> Result<()> {
    let value = state.value.clone();
    let current_dir = CrossPath::new(&state.current_dir);
    for path in tokenize_value(&value).into_iter().map(expand_alias) {
      let clean_path = clean_path(&path);
      if let Some(path) = current_dir.find_path(clean_path) {
        insert_paths(state, path.to_string())?;
      } else if path.len() <= 1 {
        insert_paths(state, current_dir.to_string())?;
      }
    }

    Ok(())
  }
}

fn clean_path(path: &str) -> &str {
  if let Some(index) = path.rfind("/") {
    &path[..index + 1]
  } else {
    path
  }
}

fn insert_paths<P: AsRef<Path>>(state: &mut ProviderState, path: P) -> Result<()> {
  if let Ok(read_dir) = fs::read_dir(path) {
    for entry in read_dir {
      let entry = entry.unwrap();
      let is_dir = entry.metadata().unwrap().is_dir();
      let name = entry.file_name().to_string_lossy().to_string();
      state.insert(
        name.clone(),
        Suggestion {
          label: name.clone(),
          insert_text: {
            if name.contains(char::is_whitespace) {
              // wrap name in quotes
              let name = format!("\"{}\"", name);
              if is_dir {
                Some(format!("{}/", name))
              } else {
                Some(name)
              }
            } else if is_dir {
              // append `/` at the end of dirs
              Some(format!("{}/", name))
            } else {
              None
            }
          },
          score: 300,
          kind: if is_dir {
            SuggestionType::Directory
          } else {
            SuggestionType::File
          },
          documentation: None,
          date: Some(
            entry
              .metadata()
              .unwrap()
              .modified()
              .unwrap()
              .duration_since(UNIX_EPOCH)
              .unwrap()
              .as_millis()
              .to_string(),
          ),
        },
      );
    }
  }
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn cleans_path() {
    let path = "dev/ter";
    assert_eq!(clean_path(path), "dev/");

    let path = "dev/termy/";
    assert_eq!(clean_path(path), "dev/termy/");

    let path = "/";
    assert_eq!(clean_path(path), "/");

    let path = "";
    assert_eq!(clean_path(path), "");
  }
}
