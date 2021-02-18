use crate::paths::CrossPath;

pub fn home() -> String {
  CrossPath::home().display()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn returns_something() {
    assert!(!home().is_empty());
  }
}
