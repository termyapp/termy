use is_executable::IsExecutable;

pub mod paths;

pub fn get_executables() -> Vec<String> {
    let path_var = std::env::var_os("PATH").unwrap();
    let paths: Vec<_> = std::env::split_paths(&path_var).collect();

    let mut executables = vec![];
    for path in paths {
        if let Ok(mut contents) = std::fs::read_dir(path) {
            while let Some(Ok(item)) = contents.next() {
                if item.path().is_executable() {
                    if let Ok(name) = item.file_name().into_string() {
                        executables.push(name);
                    }
                }
            }
        }
    }

    executables
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn getting_executables() {
        assert!(get_executables().len() > 1);
        assert!(get_executables().contains(&("cargo".to_string())));
    }
}
