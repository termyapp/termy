use std::{
  fs::{self},
  path::Path,
};

use super::{Priority, ProviderState, Suggestion, SuggestionProvider, SuggestionType};
use anyhow::Result;
use fuzzy_matcher::FuzzyMatcher;
use is_executable::IsExecutable;
use log::info;

lazy_static! {
  // todo: update this periodically
  // todo: use hashmap, since lookups are faster w/ 15 or more elements
  pub static ref EXECUTABLES: Executables = Executables::new();
}

struct Executable {
  name: String,
  documentation: Option<String>,
}

pub struct Executables {
  executables: Vec<Executable>,
}

impl Executables {
  fn new() -> Self {
    let path_var = std::env::var_os("PATH").expect("PATH not found");
    let paths: Vec<_> = std::env::split_paths(&path_var).collect();

    // todo: add `cmd` built-ins on windows
    let mut executables = vec![];
    for path in paths {
      if let Ok(mut contents) = std::fs::read_dir(path) {
        while let Some(Ok(item)) = contents.next() {
          let mut path = item.path();
          if path.is_executable() {
            #[cfg(windows)]
            {
              // PING.EXE -> PING
              path.set_extension("");
            }

            let name = path
              .file_name()
              .unwrap_or_default()
              .to_str()
              .unwrap()
              .to_string();

            let executable = Executable {
              name: if cfg!(windows) {
                name.to_lowercase()
              } else {
                name.to_owned()
              },
              documentation: tldr_docs(&name),
            };
            executables.push(executable);
          }
        }
      }
    }

    Self { executables }
  }

  pub fn contains(&self, name: &str) -> bool {
    if self.executables.contains(&name)
      || (cfg!(windows) && self.executables.contains(&name.to_lowercase()))
    {
      true
    } else {
      false
    }
  }
}

impl SuggestionProvider for Executables {
  fn suggestions(&self, state: &mut ProviderState) -> Result<()> {
    let executables = EXECUTABLES.executables.into_iter();
    for Executable {
      name,
      documentation,
    } in executables
    {
      if let Some((score, _)) = state.matcher.fuzzy_indices(&name, state.value.as_ref()) {
        state.insert(
          name.clone(),
          Suggestion {
            label: name.clone(),
            insert_text: None,
            score: if &(state.value) == &name {
              // boosting to make sure exact matches are included
              score + Priority::High as i64
            } else {
              score
            },
            kind: SuggestionType::Executable,
            documentation,
            date: None,
          },
        );
      }
    }

    Ok(())
  }
}

fn tldr_docs(name: &str) -> Option<String> {
  let path = if cfg!(debug_assertions) {
    Path::new("../../external/tldr/pages/common").join(name)
  } else {
    Path::new("../external/tldr/common").join(name)
  };
  if let Ok(contents) = fs::read_to_string(path) {
    info!("Found TLDR docs for {}", name);

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
    let executables = EXECUTABLES.executables;
    let duration = start.elapsed();

    println!("Time elapsed in expensive_function() is: {:?}", duration);
    assert!(executables.len() > 1);
  }
}
