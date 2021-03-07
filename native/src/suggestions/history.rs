use crate::util::dirs::config;
use anyhow::Result;
use chrono::Utc;
use log::error;
use std::{
  fs::{File, OpenOptions},
  io::{BufRead, BufReader, BufWriter, Write},
  path::{Path, PathBuf},
};

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

fn history_path() -> PathBuf {
  if cfg!(debug_assertions) {
    use crate::util::dirs::test_dir;
    test_dir().join("history")
  } else {
    config().join("history")
  }
}

fn parse_history() -> Vec<Entry> {
  let file = OpenOptions::new().read(true).open(history_path()).unwrap();
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
