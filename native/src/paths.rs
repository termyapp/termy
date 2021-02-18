use anyhow::Result;
use log::warn;
use path_slash::PathBufExt;
use std::{
  env, fmt,
  path::{Path, PathBuf},
};

#[derive(Debug)]
pub struct CrossPath {
  pub buf: PathBuf,
}

impl CrossPath {
  pub fn new<S: AsRef<str> + ?Sized>(s: &S) -> CrossPath {
    CrossPath {
      buf: PathBuf::from_slash(s),
    }
  }

  pub fn home() -> CrossPath {
    CrossPath::new(dirs::home_dir().unwrap().to_str().unwrap())
  }

  pub fn join<P: AsRef<Path>>(&self, path: P) -> CrossPath {
    CrossPath {
      buf: self.buf.join(path),
    }
  }

  pub fn exists(&self) -> bool {
    self.buf.exists()
  }

  pub fn canonicalize(&mut self) {
    if let Ok(b) = self.buf.canonicalize() {
      self.buf = b;
    } else {
      warn!("Failed to canonicalize path");
    }
  }
}

impl fmt::Display for CrossPath {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{}", self.buf.to_slash_lossy())
  }
}

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

#[allow(dead_code)]
pub fn test_dir() -> Result<PathBuf> {
  Ok(root_path()?.join("test"))
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  #[cfg(target_os = "windows")]
  fn converts_backslash_to_forward_slash() {
    let cross_path = CrossPath::new(r"C:\foo\bar.txt");
    assert_eq!("C:/foo/bar.txt", &(cross_path.to_string()));
  }

  #[test]
  fn home_directory() {
    let home = CrossPath::home().to_string();
    assert!(!home.contains(r"\"));

    #[cfg(target_os = "linux")]
    assert!(home.contains("/home"));

    #[cfg(not(target_os = "linux"))]
    assert!(home.contains("Users"));
  }
}
