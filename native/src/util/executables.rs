use is_executable::IsExecutable;

lazy_static! {
  pub static ref EXECUTABLES: Vec<String> = get_executables();
}

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
          executables.push(name.to_owned());
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
