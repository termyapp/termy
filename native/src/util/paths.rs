use anyhow::Result;
use path_slash::PathBufExt;
use path_slash::PathExt;
use std::{
  env,
  ffi::OsStr,
  fmt,
  path::{Path, PathBuf},
};

/// Path to Termy's root directory
///
/// Used for:
///  - external resources
///  - setting.json
///  - termy.db
///  - ...
///
/// | Environment| Dev | Production |
/// | --- | --- | --- |
/// | MacOS| `termy/electron/native` | Production |
/// | Linux| Dev | Production |
/// | Windows| Dev | Production |
///
/// Path is different during build time, running Termy in development mode and running in production
pub fn root_path() -> Result<PathBuf> {
  let path = if cfg!(debug_assertions) {
    env::current_dir()?
  } else {
    // https://www.electron.build/configuration/contents.html#filesetto
    env::current_exe()?
  };
  Ok(path)
}

pub fn test_dir() -> Result<PathBuf> {
  Ok(root_path()?.join("test"))
}

pub fn home_dir() {
  let home = dirs::home_dir().unwrap();
}

struct CrossPath {
  path: PathBuf,
}

impl CrossPath {
  pub fn new<S: AsRef<OsStr> + ?Sized>(s: &S) -> CrossPath {
    let path = Path::new(s).to_owned();
    CrossPath { path }
  }

  pub fn display(&self) -> String {
    format!("{}", self)
  }
}

impl fmt::Display for CrossPath {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.path.to_slash().unwrap())
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  #[cfg(target_os = "windows")]
  fn converts_backslash_to_forward_slash() {
    let cross_path = CrossPath::new(r"C:\foo\bar.txt");
    assert_eq!("C:/foo/bar.txt", &(cross_path.display()));
  }
}
