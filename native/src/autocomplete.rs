use crate::{paths::CrossPath, shell::tokenize_value};
use crate::{shell::expand_alias, util::executables::EXECUTABLES};
use anyhow::Result;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use log::{info, trace};
use napi::{Env, JsUnknown, Task};
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
}

impl Autocomplete {
  pub fn new(value: String, current_dir: String) -> Self {
    Self { value, current_dir }
  }
}

impl Task for Autocomplete {
  type Output = Vec<Suggestion>;
  type JsValue = JsUnknown;

  fn compute(&mut self) -> napi::Result<Self::Output> {
    let mut suggestions = Suggestions::new(self.value.clone(), self.current_dir.clone());

    // order matters since we're using a hashmap
    suggestions.paths().expect("Error in paths");
    suggestions.executables();

    let mut suggestions: Vec<Suggestion> =
      suggestions.hash_map.into_iter().map(|(_, s)| s).collect();

    suggestions.sort_by(|a, b| b.score.cmp(&a.score));

    suggestions = suggestions
      .into_iter()
      .take(100)
      .collect::<Vec<Suggestion>>();

    trace!("Suggestions: {:?}", suggestions);

    Ok(suggestions)
  }

  fn resolve(self, env: Env, output: Self::Output) -> napi::Result<Self::JsValue> {
    // needs "serde-json" feature
    env.to_js_value(&output)
  }

  // fn reject(self, env: Env, err: Error) -> Result<Self::JsValue> {
  //   self.data.unref(env)?;
  //   Err(err)
  // }
}

struct Suggestions {
  value: String,
  current_dir: String,
  matcher: SkimMatcherV2,
  hash_map: HashMap<String, Suggestion>,
}

impl Suggestions {
  fn new(value: String, current_dir: String) -> Self {
    Self {
      value,
      current_dir,
      matcher: SkimMatcherV2::default(),
      hash_map: HashMap::new(),
    }
  }

  fn insert(&mut self, key: String, value: Suggestion) {
    if let Some(s) = self.hash_map.get_mut(&key) {
      s.score += Priority::Low as i64;
    } else {
      self.hash_map.insert(key, value);
    }
  }

  fn paths(&mut self) -> Result<()> {
    let value = self.value.clone();
    let current_dir = CrossPath::new(&self.current_dir);
    for path in tokenize_value(&value).into_iter().map(expand_alias) {
      let clean_path = clean_path(&path);
      if let Some(path) = current_dir.find_path(clean_path) {
        self.path(path.to_string())?;
      } else if path.len() <= 1 {
        self.path(current_dir.to_string())?;
      }
    }

    Ok(())
  }

  fn path<P: AsRef<Path>>(&mut self, path: P) -> Result<()> {
    if let Ok(read_dir) = fs::read_dir(path) {
      for entry in read_dir {
        let entry = entry.unwrap();
        let is_dir = entry.metadata().unwrap().is_dir();
        let name = entry.file_name().to_string_lossy().to_string();
        self.insert(
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
            score: 100,
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

  fn executables(&mut self) {
    let executables = EXECUTABLES.iter();
    for executable in executables {
      // if let Ok(suggestion) = get_docs(&executable) {
      if let Some((score, _)) = self.matcher.fuzzy_indices(&executable, self.value.as_ref()) {
        self.insert(
          executable.clone(),
          Suggestion {
            label: executable.clone(),
            insert_text: None,
            score: if &(self.value) == executable {
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
  // fn zsh_history(&mut self) {
  //   // bash: ~/.bash_history
  //   // fish: ~/.local/share/fish/fish_history
  //   // zsh: /.zsh_history
  //   if let Ok(lines) =
  //     read_lines(dirs::home_dir().unwrap().to_string_lossy().to_string() + "/.zsh_history")
  //   {
  //     for line in lines {
  //       if let Ok(line) = line {
  //         if let Some(command) = line.split(";").last() {
  //           let command = command.to_string();
  //           if let Some((score, _)) = self.matcher.fuzzy_indices(&command, self.value.as_ref()) {
  //             let label =
  //               String::from(&command[find_common_words_index(self.value.as_ref(), &command)..]);
  //             self.insert(
  //               command.clone(),
  //               Suggestion {
  //                 insert_text: Some(label.clone()),
  //                 label,
  //                 score: score - Priority::High as i64,
  //                 kind: SuggestionType::ExternalHistory,
  //                 documentation: None,
  //                 date: None,
  //               },
  //             );
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
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
  File,
  Directory,
  Executable,
  ExternalHistory,
}

// to boost suggestions' score
enum Priority {
  Low = 1,
  // Medium = 25,
  High = 100,
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
  P: AsRef<Path>,
{
  let file = File::open(filename)?;
  Ok(io::BufReader::new(file).lines())
}

fn clean_path(path: &str) -> &str {
  if let Some(index) = path.rfind("/") {
    &path[..index + 1]
  } else {
    path
  }
}

fn find_common_words_index(a: &str, b: &str) -> usize {
  let mut index = 0;

  let mut other = b.split_whitespace().into_iter();
  for i in a.split_whitespace().into_iter() {
    if let Some(j) = other.next() {
      if i == j {
        index += i.len() + 1; // +1 for whitespace (it might overflow, so we return the minimum)
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
