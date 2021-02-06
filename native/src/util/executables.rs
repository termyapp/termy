use std::path::Path;

lazy_static! {
  pub static ref EXECUTABLES: Vec<String> = get_executables();
}

#[cfg(windows)]
fn pathext() -> Option<Vec<String>> {
  std::env::var_os("PATHEXT").map(|v| {
    v.to_string_lossy()
      .split(';')
      // Filter out empty tokens and ';' at the end
      .filter(|f| f.len() > 1)
      // Cut off the leading '.' character
      .map(|ext| ext[1..].to_string())
      .collect::<Vec<_>>()
  })
}

#[cfg(windows)]
fn is_executable(path: &Path) -> bool {
  if let Ok(metadata) = path.metadata() {
    let file_type = metadata.file_type();

    // If the entry isn't a file, it cannot be executable
    if !(file_type.is_file() || file_type.is_symlink()) {
      return false;
    }

    if let Some(extension) = path.extension() {
      if let Some(exts) = pathext() {
        exts
          .iter()
          .any(|ext| extension.to_string_lossy().eq_ignore_ascii_case(ext))
      } else {
        false
      }
    } else {
      false
    }
  } else {
    false
  }
}

#[cfg(unix)]
fn is_executable(path: &Path) -> bool {
  use std::os::unix::fs::PermissionsExt;

  if let Ok(metadata) = path.metadata() {
    let filetype = metadata.file_type();
    let permissions = metadata.permissions();

    // The file is executable if it is a directory or a symlink and the permissions are set for
    // owner, group, or other
    (filetype.is_file() || filetype.is_symlink()) && (permissions.mode() & 0o111 != 0)
  } else {
    false
  }
}

fn get_executables() -> Vec<String> {
  let path_var = std::env::var_os("PATH").expect("PATH not found");
  let paths: Vec<_> = std::env::split_paths(&path_var).collect();

  let mut executables = vec![];
  for path in paths {
    if let Ok(mut contents) = std::fs::read_dir(path) {
      while let Some(Ok(item)) = contents.next() {
        if is_executable(&item.path()) {
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
