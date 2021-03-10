use std::{fs::File, io::Read, path::PathBuf};

use super::{Priority, ProviderState, Suggestion, SuggestionProvider, SuggestionType};
use anyhow::Result;
use fuzzy_matcher::FuzzyMatcher;
use is_executable::IsExecutable;

lazy_static! {
  // todo: update this periodically
  pub static ref EXECUTABLES: Vec<(String, Option<String>)> = get_executables();
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
        .fuzzy_indices(&executable.0, state.value.as_ref())
      {
        state.insert(
          executable.0.clone(),
          Suggestion {
            label: executable.0.clone(),
            insert_text: None,
            score: if &(state.value) == &executable.0 {
              // boosting so for something like `bash`, the
              // `bash` executable shows up as the 1st suggestion
              score + Priority::High as i64
            } else {
              score
            },
            kind: SuggestionType::Executable,
            documentation: executable.1.clone(),
            date: None,
          },
        );
      }
    }

    Ok(())
  }
}

// todo: add `cmd` built-ins on windows
fn get_executables() -> Vec<(String, Option<String>)> {
  let path_var = std::env::var_os("PATH").expect("PATH not found");
  let paths: Vec<_> = std::env::split_paths(&path_var).collect();

  let mut executables: Vec<(String, Option<String>)> = vec![];
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
            (name.to_lowercase(), None)
          } else {
            (name.to_owned(), None)
          });

          fn read_file_into_string(path: PathBuf, mut executables: Vec<(String, Option<String>)>, string_to_concat: String) {
            let cmd_name = path
            .file_name()
            .unwrap_or_default()
            .to_str()
            .expect("File name should be UTF-8");

            let path = string_to_concat + cmd_name;

            let mut file = File::open(&path).expect("Unable to open file!");
            let mut contents = String::new();
            file.read_to_string(&mut contents).expect("Unable to transfer file contents into string!");

            executables[0].1 = std::option::Option::Some(contents);
          }
          
          if cfg!(debug_assertions) {
            read_file_into_string(path, executables, "../../external/tldr/pages/common/".to_string());
          } else {
            read_file_into_string(path, executables, "../external/tldr/common/".to_string());
          }
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
    assert!(executables[0].0.contains(&("cargo".to_string())));
  }
}
