use anyhow::{bail, Result};
use std::{fs, path::Path};

pub fn view<P: AsRef<Path>>(path: P) -> Result<String> {
    if !path.as_ref().exists() {
        bail!("{} does not exist", path.as_ref().display());
    } else if !path.as_ref().is_file() {
        bail!("{} is not a file", path.as_ref().display());
    } else {
        let extension = path.as_ref().extension().unwrap_or_default();
        let content = fs::read_to_string(&path)?;

        Ok(format!(
            "```{}\n{}\n```",
            extension.to_string_lossy(),
            content
        ))
    }
}

#[cfg(test)]
mod tests {
    use crate::util::paths::test_dir;

    use super::*;

    #[test]
    fn reads_markdown_file() {
        let readme_file = test_dir().unwrap().join("readme.md");
        assert_eq!(
            view(readme_file).unwrap(),
            "```md\nFiles and folders to test the internal commands.\n\n```".to_string()
        );
    }

    #[test]
    fn file_does_not_exist() {
        let non_existing = test_dir().unwrap().join("non_existing_file");

        assert!(view(non_existing).is_err());
    }
}
