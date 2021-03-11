use anyhow::Result;
use executables::EXECUTABLES;
use fuzzy_matcher::skim::SkimMatcherV2;
use history::HISTORY;
use napi::{Env, JsUnknown, Task};
use paths::Paths;
use serde::Serialize;
use std::collections::HashMap;

pub mod executables;
pub mod history;
mod paths;

pub struct Suggestions(pub String, pub String);

impl Task for Suggestions {
  type Output = Vec<Suggestion>;
  type JsValue = JsUnknown;

  fn compute(&mut self) -> napi::Result<Self::Output> {
    let mut state = ProviderState::new(self.0.clone(), self.1.clone());
    let history = HISTORY.lock().unwrap();

    // order matters since we're using a hashmap
    EXECUTABLES.suggestions(&mut state).unwrap();
    Paths.suggestions(&mut state).unwrap();
    history.suggestions(&mut state).unwrap();

    let mut suggestions: Vec<Suggestion> = state.hash_map.into_iter().map(|(_, s)| s).collect();
    suggestions.sort_by(|a, b| b.score.cmp(&a.score));
    suggestions = suggestions
      .into_iter()
      .take(100)
      .collect::<Vec<Suggestion>>();

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
  History,
  // ExternalHistory,
}

// to boost suggestions' score
enum Priority {
  One = 1,
  Low = 16,
  Medium = 32,
  High = 64,
}
