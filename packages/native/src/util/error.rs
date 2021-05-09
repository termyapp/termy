use serde::Serialize;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, TermyError>;

#[derive(Serialize, Error, Debug)]
pub enum TermyError {
  #[error("Invalid argument provided")]
  InvalidArgument,

  #[error("Couldn't find path `{0}`")]
  InvalidPath(String),

  #[error("Provided path `{0}` is not a directory")]
  NotDirectory(String),

  #[error("Provided path `{0}` is not a file")]
  NotFile(String),

  #[error("Command `{0}` not found")]
  NotFound(String),

  #[error("Invalid theme `{0}`")]
  InvalidTheme(String),

  #[error("Unkown error")]
  Unkown,
}
