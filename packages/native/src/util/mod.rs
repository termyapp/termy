use std::cmp;

pub mod cross_path;
pub mod dirs;
pub mod error;
pub mod parser;

pub fn find_common_words_index(a: &str, b: &str) -> usize {
  let mut index = 0;

  let mut other = b.split_whitespace().into_iter();
  for i in a.split_whitespace().into_iter() {
    if let Some(j) = other.next() {
      if i == j {
        index += i.len() + 1; // +1 for whitespace
      }
    }
  }

  // might overflow because of the +1, so we return the minimum
  cmp::min(index, cmp::min(a.len(), b.len()))
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn find_common_words() {
    let a = "git commit --message \"Init\"";
    let b = "git commit -m";

    assert_eq!(find_common_words_index(a, b), 11);
  }

  #[test]
  fn doesnt_overflow() {
    let a = "l";
    let b = "l arg";
    let c = "n";

    assert_eq!(find_common_words_index(a, b), 1);

    assert_eq!(find_common_words_index(b, c), 0);
  }
}
