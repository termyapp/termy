use anyhow::Result;
use std::{env, path::PathBuf};

/// Path to Termy's root directory
///
/// Used for:
///  - External resources (eg. TLDR pages)
///  - setting.json
///  - termy.db
///  - ...
///
/// | Environment| Dev | Production |
/// | --- | --- | --- |
/// | MacOS| `termy/electron/native` | `` |
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
    Ok(root_path()?.join(".test"))
}

#[cfg(test)]
mod tests {
    use super::*;
}
