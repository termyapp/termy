use anyhow::Result;
use executables::Executables;
use fuzzy_matcher::skim::SkimMatcherV2;
use log::trace;
use napi::{Env, JsUnknown, Task};
use paths::Paths;
use serde::Serialize;
use std::{cmp, collections::HashMap};

pub mod executables;
mod history;
mod paths;

pub struct Suggestions(pub String, pub String);

impl Task for Suggestions {
  type Output = Vec<Suggestion>;
  type JsValue = JsUnknown;

  fn compute(&mut self) -> napi::Result<Self::Output> {
    let mut state = ProviderState::new(self.0.clone(), self.1.clone());

    // order matters since we're using a hashmap
    Executables.suggestions(&mut state).unwrap();
    Paths.suggestions(&mut state).unwrap();
    // history -> (value, current_dir) -> if current_dir == dir { boost }
    // history -> current_dir ->

    let mut suggestions: Vec<Suggestion> = state.hash_map.into_iter().map(|(_, s)| s).collect();
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

pub trait SuggestionProvider {
  fn suggestions(&self, state: &mut ProviderState) -> Result<()>;
}

pub struct ProviderState {
  value: String,
  current_dir: String,
  matcher: SkimMatcherV2,
  hash_map: HashMap<String, Suggestion>,
}

impl ProviderState {
  fn new(current_dir: String, value: String) -> Self {
    Self {
      value,
      current_dir,
      matcher: SkimMatcherV2::default(),
      hash_map: HashMap::new(),
    }
  }

  fn insert(&mut self, key: String, value: Suggestion) {
    if let Some(s) = self.hash_map.get_mut(&key) {
      s.score += Priority::One as i64;
    } else {
      self.hash_map.insert(key, value);
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
  File,
  Directory,
  Executable,
  ExternalHistory,
}

// to boost suggestions' score
enum Priority {
  One = 1,
  Low = 16,
  Medium = 32,
  High = 64,
}

fn find_common_words_index(a: &str, b: &str) -> usize {
  let mut index = 0;

  let mut other = b.split_whitespace().into_iter();
  for i in a.split_whitespace().into_iter() {
    if let Some(j) = other.next() {
      if i == j {
        index += i.len() + 1; // +1 for whitespace
      }
    }
  }

  // might overflow because of the +1, so we return the minimum
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
