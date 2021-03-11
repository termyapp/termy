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
/// | Linux| termy/electron/native | /tmp/Termy-mount-XXXX/ |
/// | Windows| termy/electron/native | AppData\\Local\\Programs\\termy-electron |
///
/// Path is different during build time, running Termy in development mode and running in production
pub fn root_path() -> PathBuf {
  if cfg!(debug_assertions) {
    // todo: fix this (problem is there are 2 different debug paths (native, electron))
    dirs::home_dir().unwrap().join("dev/termy/native")
  } else {
    if cfg!(target_os = "macos") {
      env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
    } else {
      env::current_exe().unwrap().parent().unwrap().to_path_buf()
    }
  }
}

#[allow(dead_code)]
pub fn test_dir() -> PathBuf {
  root_path().join("test")
}
