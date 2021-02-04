use crate::util::get_executables;
use anyhow::Result;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use log::{error, info};
use serde::Serialize;
use std::{cmp, io};
use std::{
  collections::HashMap,
  fs::{self, File},
  io::BufRead,
  path::Path,
  time::UNIX_EPOCH,
};

pub struct Autocomplete {
  value: String,
  current_dir: String,
  matcher: SkimMatcherV2,
  suggestions: HashMap<String, Suggestion>,
}

impl Autocomplete {
  pub fn new(value: String, current_dir: String) -> Self {
    Self {
      value,
      current_dir,
      matcher: SkimMatcherV2::default(),
      suggestions: HashMap::new(),
    }
  }

  pub fn suggestions(mut self) -> Vec<Suggestion> {
    if self.value.len() < 1 {
      return vec![];
    }

    // order matters since we're using a hashmap
    self.directories().expect("Error in directories");
    self.executables();
    self.zsh_history();

    let mut suggestions: Vec<Suggestion> = self.suggestions.into_iter().map(|(_, s)| s).collect();

    suggestions.sort_by(|a, b| b.score.cmp(&a.score));

    suggestions = suggestions
      .into_iter()
      .take(20)
      .collect::<Vec<Suggestion>>();

    suggestions
  }

  fn insert(&mut self, key: String, value: Suggestion) {
    if let Some(s) = self.suggestions.get_mut(&key) {
      s.score += Priority::Low as i64;
    } else {
      self.suggestions.insert(key, value);
    }
  }

  // directory suggestions
  fn directories(&mut self) -> Result<()> {
    let mut dir = String::new();
    let mut value = self.value.clone();
    let mut chunks = value.split('/').peekable();
    while let Some(chunk) = chunks.next() {
      if chunks.peek().is_none() {
        value = chunk.to_string();
        break;
      }
      dir += &(format!("{}/", chunk));
    }

    let dir = self.current_dir.clone() + &(format!("/{}", dir.clone()));
    info!("Suggestions from directory: {}", dir);

    if let Ok(read_dir) = fs::read_dir(&dir) {
      for entry in read_dir {
        let entry = entry.unwrap();
        if !entry.metadata().unwrap().is_dir() {
          continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if let Some((score, _)) = self.matcher.fuzzy_indices(name.as_str(), value.as_ref()) {
          self.insert(
            name.clone(),
            Suggestion {
              label: name.clone(),
              insert_text: Some(format!("{}/", name)),
              score: score + Priority::Medium as i64,
              kind: SuggestionType::Directory,
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
    } else {
      error!("Invalid directory: {}", dir);
    }

    Ok(())
  }

  fn executables(&mut self) {
    for executable in get_executables() {
      // if let Ok(suggestion) = get_docs(&executable) {
      if let Some((score, _)) = self.matcher.fuzzy_indices(&executable, self.value.as_ref()) {
        self.suggestions.insert(
          executable.clone(),
          Suggestion {
            label: executable.clone(),
            insert_text: None,
            score: if self.value == executable {
              // boosting so for something like `bash`, the
              // `bash` executable shows up as the 1st suggestion
              score + Priority::High as i64
            } else {
              score
            },
            kind: SuggestionType::Executable,
            documentation: None,
            date: None,
          },
        );
      }
    }
  }

  // todo: index these during init
  fn zsh_history(&mut self) {
    // bash: ~/.bash_history
    // fish: ~/.local/share/fish/fish_history
    // zsh: /.zsh_history
    if let Ok(lines) =
      read_lines(dirs::home_dir().unwrap().to_string_lossy().to_string() + "/.zsh_history")
    {
      for line in lines {
        if let Ok(line) = line {
          if let Some(command) = line.split(";").last() {
            let command = command.to_string();
            if let Some((score, _)) = self.matcher.fuzzy_indices(&command, self.value.as_ref()) {
              let label =
                String::from(&command[find_common_words_index(self.value.as_ref(), &command)..]);
              self.insert(
                command.clone(),
                Suggestion {
                  insert_text: Some(label.clone()),
                  label,
                  score: score - Priority::High as i64,

                  kind: SuggestionType::ExternalHistory,
                  documentation: None,
                  date: None,
                },
              );
            }
          }
        }
      }
    }
  }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
  label: String,
  kind: SuggestionType,
  score: i64,

  #[serde(skip_serializing_if = "Option::is_none")]
  insert_text: Option<String>,

  #[serde(skip_serializing_if = "Option::is_none")]
  documentation: Option<String>,

  #[serde(skip_serializing_if = "Option::is_none")]
  date: Option<String>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum SuggestionType {
  Directory,
  Executable,
  ExternalHistory,
}

// to boost suggestions' score
enum Priority {
  Low = 1,
  Medium = 25,
  High = 100,
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
  P: AsRef<Path>,
{
  let file = File::open(filename)?;
  Ok(io::BufReader::new(file).lines())
}

fn find_common_words_index(a: &str, b: &str) -> usize {
  let mut index = 0;

  let mut other = b.split_whitespace().into_iter();
  for i in a.split_whitespace().into_iter() {
    if let Some(j) = other.next() {
      if i == j {
        index += i.len() + 1; // +1 for whitespace (might overlow, so we return the minimum)
      }
    }
  }

  cmp::min(index, cmp::min(a.len(), b.len()))
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn find_common_words() {
    let a = "git commit --message \"Init\"";
    let b = "git commit -m";

    assert_eq!(find_common_words_index(a, b), 11);
  }

  #[test]
  fn doesnt_overflow() {
    let a = "l";
    let b = "l arg";
    let c = "n";

    assert_eq!(find_common_words_index(a, b), 1);

    assert_eq!(find_common_words_index(b, c), 0);
  }
}
