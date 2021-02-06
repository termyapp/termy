use is_executable::IsExecutable;

lazy_static! {
  pub static ref EXECUTABLES: Vec<String> = get_executables();
}

pub fn get_executables() -> Vec<String> {
  let path_var = std::env::var_os("PATH").unwrap();
  let paths: Vec<_> = std::env::split_paths(&path_var).collect();

  let mut executables = vec![];
  for path in paths {
    if let Ok(mut contents) = std::fs::read_dir(path) {
      while let Some(Ok(item)) = contents.next() {
        if item.path().is_executable() {
          if let Ok(name) = item.file_name().into_string() {
            executables.push(name);
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
    assert!(executables.contains(&("PING.EXE".to_string())));
  }
}
