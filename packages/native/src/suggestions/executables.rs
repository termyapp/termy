use super::{Priority, ProviderState, Suggestion, SuggestionProvider, SuggestionType};
use crate::util::dirs::root_path;
use anyhow::Result;
use fuzzy_matcher::FuzzyMatcher;
use is_executable::IsExecutable;
use log::{info, trace};
use std::{
  collections::HashMap,
  fs::{self},
};

lazy_static! {
  // todo: update this periodically
  pub static ref EXECUTABLES: Executables = Executables::new();
}

pub struct Executables {
  executables: HashMap<String, Option<String>>, // name, documentation
}

impl Executables {
  fn new() -> Self {
    let path_var = std::env::var_os("PATH").expect("PATH not found");
    let paths: Vec<_> = std::env::split_paths(&path_var).collect();

    // todo: add `cmd` built-ins on windows
    let mut executables = HashMap::new();
    for path in paths {
      if let Ok(mut contents) = std::fs::read_dir(path) {
        while let Some(Ok(item)) = contents.next() {
          let mut path = item.path();
          if path.is_executable() {
            // PING.EXE -> PING
            path.set_extension("");

            let name = path
              .file_name()
              .unwrap_or_default()
              .to_str()
              .unwrap()
              .to_string();

            let key = if cfg!(windows) {
              name.to_lowercase()
            } else {
              name.to_owned()
            };

            executables.insert(key, tldr_docs(&name));
          }
        }
      }
    }

    Self { executables }
  }

  pub fn contains(&self, name: &str) -> bool {
    self.executables.contains_key(name)
      // commands on windows are not case sensitive
      || (cfg!(windows) && self.executables.contains_key(&name.to_lowercase()))
  }
}

impl SuggestionProvider for Executables {
  fn suggestions(&self, state: &mut ProviderState) -> Result<()> {
    let executables = self.executables.iter();
    for (name, documentation) in executables {
      if let Some(score) = state.matcher.fuzzy_match(&name, state.value.as_ref()) {
        state.insert(
          name.clone(),
          Suggestion {
            label: name.clone(),
            insert_text: None,
            score: if &state.value == name {
              // boosting to make sure exact matches are included
              score + Priority::High as i64
            } else {
              score
            },
            kind: SuggestionType::Executable,
            documentation: documentation.clone(),
            date: None,
          },
        );
      }
    }

    Ok(())
  }
}

fn tldr_docs(name: &str) -> Option<String> {
  let tldr_path = if cfg!(debug_assertions) {
    root_path().join("../external/tldr/pages/common")
  } else {
    root_path().join("tldr/common")
  };

  let path = tldr_path.join(name.to_lowercase() + ".md");

  trace!("TDLR {:?}", path);

  if let Ok(contents) = fs::read_to_string(path) {
    // info!("Found TLDR docs at: {:?}", path);
    return Some(contents);
  }

  None
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::time::Instant;

  #[test]
  fn getting_executables() {
    let start = Instant::now();
    let executables = EXECUTABLES.executables.keys();
    let duration = start.elapsed();

    println!("Time elapsed: {:?}", duration);
    assert!(executables.len() > 1);
  }
}
