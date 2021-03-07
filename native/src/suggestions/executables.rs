use super::{Priority, ProviderState, Suggestion, SuggestionProvider, SuggestionType};
use anyhow::Result;
use fuzzy_matcher::FuzzyMatcher;
use is_executable::IsExecutable;

lazy_static! {
  // todo: update this periodically
   pub static ref EXECUTABLES: Vec<String> = get_executables();
}

pub struct Executables;

impl SuggestionProvider for Executables {
  fn suggestions(&self, state: &mut ProviderState) -> Result<()> {
    let executables = EXECUTABLES.iter();
    for executable in executables {
      // todo: get tldr docs
      // if let Ok(suggestion) = get_docs(&executable) {
      if let Some((score, _)) = state
        .matcher
        .fuzzy_indices(&executable, state.value.as_ref())
      {
        state.insert(
          executable.clone(),
          Suggestion {
            label: executable.clone(),
            insert_text: None,
            score: if &(state.value) == executable {
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

    Ok(())
  }
}

// todo: add `cmd` built-ins on windows
fn get_executables() -> Vec<String> {
  let path_var = std::env::var_os("PATH").expect("PATH not found");
  let paths: Vec<_> = std::env::split_paths(&path_var).collect();

  let mut executables = vec![];
  for path in paths {
    if let Ok(mut contents) = std::fs::read_dir(path) {
      while let Some(Ok(item)) = contents.next() {
        let mut path = item.path();
        if path.is_executable() {
          path.set_extension("");
          let name = path
            .file_name()
            .unwrap_or_default()
            .to_str()
            .expect("File name should be UTF-8");

          executables.push(if cfg!(windows) {
            name.to_lowercase()
          } else {
            name.to_owned()
          });
        }
      }
    }
  }

  executables
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::time::Instant;

  #[test]
  fn getting_executables() {
    let start = Instant::now();
    let executables = get_executables();
    let duration = start.elapsed();

    println!("Time elapsed in expensive_function() is: {:?}", duration);
    assert!(executables.len() > 1);
    assert!(executables.contains(&("cargo".to_string())));
  }
}
