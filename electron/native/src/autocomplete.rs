use anyhow::Result;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use is_executable::IsExecutable;
use relative_path::RelativePath;
use serde::Serialize;
use std::io;
use std::{
    collections::HashMap,
    env,
    fs::{self, File},
    io::BufRead,
    path::Path,
    time::UNIX_EPOCH,
};

pub struct Autocomplete {
    input: String,
    current_dir: String,
    matcher: SkimMatcherV2,
    suggestions: Vec<Suggestion>,
}

impl Autocomplete {
    pub fn new(input: String, current_dir: String) -> Self {
        Self {
            input,
            current_dir,
            matcher: SkimMatcherV2::default(),
            suggestions: vec![],
        }
    }

    pub fn suggestions(mut self) -> Vec<Suggestion> {
        if self.input.len() < 1 {
            return vec![];
        }

        self.directories();
        self.executables();
        self.zsh_history();

        self.suggestions.sort_by(|a, b| b.score.cmp(&a.score));

        self.suggestions = self
            .suggestions
            .into_iter()
            .take(20)
            .collect::<Vec<Suggestion>>();

        self.suggestions
    }

    // directory suggestions
    fn directories(&mut self) -> Result<()> {
        let mut directories = fs::read_dir(self.current_dir.clone())?
            .filter_map(|e| {
                let entry = e.unwrap();
                if !entry.metadata().unwrap().is_dir() {
                    return None;
                }
                let name = entry.file_name().to_string_lossy().to_string();
                if let Some((score, indexes)) = self
                    .matcher
                    .fuzzy_indices(name.as_str(), self.input.as_ref())
                {
                    Some(Suggestion {
                        command: name.clone(),
                        display: name,
                        score,
                        indexes,
                        kind: SuggestionType::Directory,
                        documentation: None,
                        date: Some(
                            entry
                                .metadata()
                                .unwrap()
                                .modified()
                                .unwrap()
                                .duration_since(UNIX_EPOCH)
                                .unwrap()
                                .as_millis()
                                .to_string(),
                        ),
                    })
                } else {
                    None
                }
            })
            .collect::<Vec<Suggestion>>();

        self.suggestions.append(&mut directories);

        Ok(())
    }

    fn executables(&mut self) {
        for executable in get_executables() {
            // if let Ok(suggestion) = get_docs(&executable) {
            if let Some((score, indexes)) =
                self.matcher.fuzzy_indices(&executable, self.input.as_ref())
            {
                self.suggestions.push(Suggestion {
                    command: executable.clone(),
                    display: executable.clone(),
                    score: if self.input == executable {
                        // boosting so for something like `bash`, the
                        // `bash` executable shows up as the 1st suggestion
                        score + Boost::High as i64
                    } else {
                        score
                    },
                    indexes,
                    kind: SuggestionType::Executable,
                    documentation: if let Ok(docs) = get_docs(&executable) {
                        Some(docs)
                    } else {
                        None
                    },
                    date: None,
                })
            }
        }
    }

    // todo: index these during init
    fn zsh_history(&mut self) {
        // bash: ~/.bash_history
        // fish: ~/.local/share/fish/fish_history
        // zsh: /.zsh_history
        if let Ok(lines) =
            read_lines(dirs::home_dir().unwrap().to_string_lossy().to_string() + "/.zsh_history")
        {
            let mut commands: HashMap<String, Suggestion> = HashMap::new();

            for line in lines {
                if let Ok(line) = line {
                    if let Some(command) = line.split(";").last() {
                        let command = command.to_string();
                        if let Some((score, indexes)) =
                            self.matcher.fuzzy_indices(&command, self.input.as_ref())
                        {
                            if let Some(c) = commands.get_mut(&command) {
                                c.score += Boost::Low as i64;
                            } else {
                                commands.insert(
                                    command.clone(),
                                    Suggestion {
                                        command: command.clone(),
                                        display: command,
                                        score,
                                        indexes,
                                        kind: SuggestionType::Bash,
                                        documentation: None,
                                        date: None,
                                    },
                                );
                            }
                        }
                    }
                }
            }

            for (_, s) in commands {
                self.suggestions.push(s);
            }
        }
    }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
    command: String, // the full command that will be inserted
    display: String,
    score: i64,
    indexes: Vec<usize>,
    kind: SuggestionType, // `type` is reserved keyword smh...
    #[serde(skip_serializing_if = "Option::is_none")]
    documentation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    date: Option<String>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum SuggestionType {
    Bash,
    Directory,
    Executable,
}

// to boost suggestions' score
enum Boost {
    Low = 1,
    Medium = 25,
    High = 100,
}

fn get_executables() -> Vec<String> {
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

fn get_docs(command: &str) -> Result<String> {
    let cwd = env::current_dir()?.to_string_lossy().to_string();
    // todo: bundled production path
    let path = RelativePath::new(&cwd).join_normalized(
        "/../typed-cli/repositories/tldr/pages/common/".to_string() + command + ".md",
    );
    // info!("Trying get docs from {}", path);
    let path = path.to_path("");

    Ok(fs::read_to_string(path)?)
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
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
