use std::{env, fs, path::PathBuf};

use log::{error, info};

// $HOME_DIR/.termy
pub fn config() -> PathBuf {
  let path = dirs::home_dir().unwrap().join(".termy");

  if !path.exists() {
    // create the directory if it doesn't exist
    info!("Creating config directory at `{}`", path.to_string_lossy());
    if let Err(err) = fs::create_dir(&path) {
      error!("Error creating config directory: {}", err);
    }
  }

  path
}

/// | Environment| Dev | Production |
/// | --- | --- | --- |
/// | MacOS| termy/electron/native | Termy.app/Contents/MacOS/Termy |
/// | Linux| termy/electron/native | ? |
/// | Windows| termy/electron/native | ? |
///
/// Path is different during build time, running Termy in development mode and running in production
pub fn root_path() -> PathBuf {
  if cfg!(debug_assertions) {
    // todo: fix this (problem is there are 2 different debug paths (native, electron))
    dirs::home_dir().unwrap().join("dev/termy/native")
  } else {
    // https://www.electron.build/configuration/contents.html#filesetto
    env::current_exe().unwrap()
  }
}

#[allow(dead_code)]
pub fn test_dir() -> PathBuf {
  root_path().join("test")
}
