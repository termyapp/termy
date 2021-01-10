use crate::util::{get_executables, paths::root_path};
use anyhow::Result;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use log::info;
use serde::Serialize;
use std::io;
use std::{
    collections::HashMap,
    fs::{self, File},
    io::BufRead,
    path::Path,
    time::UNIX_EPOCH,
};

pub struct Autocomplete {
    input: String,
    current_dir: String,
    matcher: SkimMatcherV2,
    suggestions: HashMap<String, Suggestion>,
}

impl Autocomplete {
    pub fn new(input: String, current_dir: String) -> Self {
        Self {
            input,
            current_dir,
            matcher: SkimMatcherV2::default(),
            suggestions: HashMap::new(),
        }
    }

    pub fn suggestions(mut self) -> Vec<Suggestion> {
        if self.input.len() < 1 {
            return vec![];
        }

        // order matters since we're using a hashmap
        self.directories().unwrap();
        self.executables();
        self.zsh_history();

        let mut suggestions: Vec<Suggestion> =
            self.suggestions.into_iter().map(|(_, s)| s).collect();

        suggestions.sort_by(|a, b| b.score.cmp(&a.score));

        suggestions = suggestions
            .into_iter()
            .take(20)
            .collect::<Vec<Suggestion>>();

        suggestions
    }

    fn insert(&mut self, key: String, value: Suggestion) {
        if let Some(s) = self.suggestions.get_mut(&key) {
            s.score += Priority::Low as i64;
        } else {
            self.suggestions.insert(key, value);
        }
    }

    // directory suggestions
    fn directories(&mut self) -> Result<()> {
        let mut dir = String::new();
        let mut input = self.input.clone();
        let mut chunks = input.split('/').peekable();
        while let Some(chunk) = chunks.next() {
            if chunks.peek().is_none() {
                input = chunk.to_string();
                break;
            }
            dir += &(format!("{}/", chunk));
        }

        for entry in fs::read_dir(self.current_dir.clone() + &(format!("/{}", dir.clone())))? {
            let entry = entry.unwrap();
            if !entry.metadata().unwrap().is_dir() {
                continue;
            }
            let name = entry.file_name().to_string_lossy().to_string();
            if let Some((score, indexes)) =
                self.matcher.fuzzy_indices(name.as_str(), input.as_ref())
            {
                self.insert(
                    name.clone(),
                    Suggestion {
                        full_command: Some(dir.clone() + &name),
                        command: name.clone(),
                        score: score + Priority::Medium as i64,
                        indexes,
                        kind: SuggestionType::Directory,
                        tldr_documentation: None,
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
                    },
                );
            }
        }

        Ok(())
    }

    fn executables(&mut self) {
        for executable in get_executables() {
            // if let Ok(suggestion) = get_docs(&executable) {
            if let Some((score, indexes)) =
                self.matcher.fuzzy_indices(&executable, self.input.as_ref())
            {
                self.suggestions.insert(
                    executable.clone(),
                    Suggestion {
                        full_command: Some(executable.clone()),
                        command: executable.clone(),
                        score: if self.input == executable {
                            // boosting so for something like `bash`, the
                            // `bash` executable shows up as the 1st suggestion
                            score + Priority::High as i64
                        } else {
                            score
                        },
                        indexes,
                        kind: SuggestionType::Executable,
                        tldr_documentation: if let Ok(docs) = get_docs(&executable) {
                            Some(docs)
                        } else {
                            None
                        },
                        date: None,
                    },
                );
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
            for line in lines {
                if let Ok(line) = line {
                    if let Some(command) = line.split(";").last() {
                        let command = command.to_string();
                        if let Some((score, indexes)) =
                            self.matcher.fuzzy_indices(&command, self.input.as_ref())
                        {
                            self.insert(
                                command.clone(),
                                Suggestion {
                                    full_command: Some(command.clone()),
                                    command,
                                    score: score - Priority::High as i64,
                                    indexes,
                                    kind: SuggestionType::ExternalHistory,
                                    tldr_documentation: None,
                                    date: None,
                                },
                            );
                        }
                    }
                }
            }
        }
    }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
    full_command: Option<String>, // the full command that will be inserted
    command: String,
    score: i64,
    indexes: Vec<usize>,
    kind: SuggestionType, // `type` is reserved keyword smh...
    #[serde(skip_serializing_if = "Option::is_none")]
    tldr_documentation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    date: Option<String>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum SuggestionType {
    Directory,
    Executable,
    ExternalHistory,
}

// to boost suggestions' score
enum Priority {
    Low = 1,
    Medium = 25,
    High = 100,
}

fn get_docs(command: &str) -> Result<String> {
    // .join_normalized("/../../tldr/".to_string() + command + ".md")
    let path = format!(
        "{}/external/tldr/pages/common/{}.md",
        root_path()?.to_string_lossy(),
        command
    );

    info!("Path: {:?}", path);

    Ok(fs::read_to_string(path)?)
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}
