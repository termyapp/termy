use crate::paths::CrossPath;

pub fn home() -> String {
  CrossPath::home().to_string()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn returns_something() {
    assert!(!home().is_empty());
  }
}
