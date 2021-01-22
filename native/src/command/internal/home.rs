pub fn home() -> String {
    dirs::home_dir()
        .unwrap()
        .into_os_string()
        .into_string()
        .unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_something() {
        assert!(!home().is_empty());
    }
}
