use crate::{util::cross_path, util::dirs::config};
use anyhow::Result;
use chrono::Utc;
use std::{
  fs::{File, OpenOptions},
  io::{BufRead, BufReader, BufWriter},
  path::{Path, PathBuf},
};

lazy_static! {
  //   pub static ref EXECUTABLES: Vec<String> = get_executables();
}

pub struct History {
  entries: Vec<Entry>,
}

#[derive(Debug, PartialEq)]
struct Entry {
  date: String,
  current_dir: String,
  value: String,
}

impl History {
  pub fn new() -> Self {
    let entries = parse_history(history_path());

    Self { entries }
  }

  pub fn add(&self, current_dir: String, value: String) {
    let file = OpenOptions::new()
      .append(true)
      .create(true)
      .open(history_path())
      .unwrap();
    let writer = BufWriter::new(file);
    let entry = Entry {
      date: Utc::now().to_string(),
      current_dir,
      value,
    };
  }
}

fn history_path() -> PathBuf {
  config().join("history")
}

fn parse_history<P: AsRef<Path>>(path: P) -> Vec<Entry> {
  let file = OpenOptions::new()
    .create(true)
    .read(true)
    .open(path)
    .unwrap();
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
  use crate::util::dirs::test_dir;

  #[test]
  fn parses_history() {
    assert_eq!(
      parse_history(test_dir().join("history")), // make sure entries are tab in the history file
      vec![
        Entry {
          date: "1".to_string(),
          current_dir: "/".to_string(),
          value: "echo first history item".to_string(),
        },
        Entry {
          date: "4242424242".to_string(),
          current_dir: "/Library/Application Support".to_string(),
          value: "/".to_string(),
        }
      ]
    )
  }
}
