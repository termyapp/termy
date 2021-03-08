use crate::util::{dirs::config, find_common_words_index};
use anyhow::Result;
use chrono::Utc;
use fuzzy_matcher::FuzzyMatcher;
use log::{error, info};
use std::{
  fs::{self, File, OpenOptions},
  io::{BufRead, BufReader, BufWriter, Write},
  path::{Path, PathBuf},
};

use super::{Priority, Suggestion, SuggestionProvider, SuggestionType};

lazy_static! {
  //   pub static ref EXECUTABLES: Vec<String> = get_executables();
}

pub struct History {
  pub entries: Vec<Entry>,
}

#[derive(Debug, PartialEq)]
pub struct Entry {
  date: String,
  current_dir: String,
  value: String,
}

impl History {
  pub fn new() -> Self {
    let entries = parse_history();

    Self { entries }
  }

  pub fn add(&mut self, current_dir: String, value: String) {
    let entry = Entry {
      date: Utc::now().to_string(),
      current_dir,
      value,
    };

    let file = OpenOptions::new()
      .append(true)
      .create(true)
      .open(history_path())
      .unwrap();
    let mut writer = BufWriter::new(file);
    if let Err(err) = write!(
      writer,
      "\n{}\t{}\t{}",
      entry.date, entry.current_dir, entry.value
    ) {
      error!("Error while adding history entry: {}", err);
    }

    self.entries.push(entry);
  }
}

impl SuggestionProvider for History {
  fn suggestions(&self, state: &mut super::ProviderState) -> Result<()> {
    // todo: current_dir -> diff path
    for entry in &self.entries {
      if let Some((score, _)) = state
        .matcher
        .fuzzy_indices(&entry.value, state.value.as_ref())
      {
        let label =
          String::from(&entry.value[find_common_words_index(state.value.as_ref(), &entry.value)..]);
        state.insert(
          entry.value.clone(),
          Suggestion {
            label,
            insert_text: None,
            score: if entry.current_dir == state.current_dir {
              score + Priority::High as i64
            } else {
              score
            },
            kind: SuggestionType::History,
            documentation: None,
            date: None,
          },
        );
      }
    }

    Ok(())
  }
}

fn history_path() -> PathBuf {
  if cfg!(debug_assertions) {
    use crate::util::dirs::test_dir;
    test_dir().join("history")
  } else {
    let path = config().join("history");

    if !path.exists() {
      // create the directory if it doesn't exist
      info!("Creating config directory at `{}`", path.to_string_lossy());
      if let Err(err) = File::create(&path) {
        error!("Error creating config directory: {}", err);
      }
    }

    path
  }
}

fn parse_history() -> Vec<Entry> {
  let file = File::open(history_path()).unwrap();
  let reader = BufReader::new(file);
  let mut entries = vec![];

  for result in reader.lines() {
    if let Ok(line) = result {
      let mut column = line.split('\t');
      let date = column.next().unwrap_or_default().to_owned();
      let current_dir = column.next().unwrap_or_default().to_owned();
      let value = column.next().unwrap_or_default().to_owned();
      entries.push(Entry {
        date,
        current_dir,
        value,
      })
    }
  }

  entries
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn parses_history() {
    let mut history = parse_history().into_iter();
    assert_eq!(
      history.next().unwrap(),
      Entry {
        date: "1".to_string(),
        current_dir: "/".to_string(),
        value: "echo first history item".to_string(),
      }
    );

    assert_eq!(
      history.next().unwrap(),
      Entry {
        date: "4242424242".to_string(),
        current_dir: "/Library/Application Support".to_string(),
        value: "/".to_string(),
      }
    )
  }

  #[test]
  fn add_to_history() {
    let mut history = History::new();
    let value = Utc::now().to_string();
    let value_clone = value.clone();
    history.add("current_dir".to_string(), value);
    assert_eq!(
      history.entries.into_iter().last().unwrap().value,
      value_clone
    );
  }
}
