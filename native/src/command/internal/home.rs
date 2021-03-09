use crate::util::cross_path::CrossPath;

pub fn home() -> String {
  CrossPath::home().to_string()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn home_not_empty() {
    assert!(!home().is_empty());
  }
}
