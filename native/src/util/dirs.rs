use std::{env, path::PathBuf};

pub fn config() -> PathBuf {
  if cfg!(debug_assertions) {
    // electron/.termy
    env::current_dir().unwrap().join("../.termy")
  } else {
    // HOME_DIR/.termy
    dirs::home_dir().unwrap().join(".termy")
  }
}

/// | Environment| Dev | Production |
/// | --- | --- | --- |
/// | MacOS| `termy/electron/native` | ? |
/// | Linux| ? | ? |
/// | Windows| ? | ? |
///
/// Path is different during build time, running Termy in development mode and running in production
pub fn root_path() -> PathBuf {
  let path = if cfg!(debug_assertions) {
    env::current_dir()
  } else {
    // https://www.electron.build/configuration/contents.html#filesetto
    env::current_exe()
  };
  path.unwrap()
}

#[allow(dead_code)]
pub fn test_dir() -> PathBuf {
  root_path().join("test")
}
