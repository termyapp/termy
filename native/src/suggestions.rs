use anyhow::Result;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use serde::Serialize;
use std::fs;
use std::process::Command;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
    pub name: String,
    pub score: i64,
    pub command: String,
}

pub fn get_suggestions(input: String, current_dir: String) -> Result<Vec<Suggestion>> {
    let mut suggestions = vec![];
    let matcher = SkimMatcherV2::default();

    let mut parts = input.trim().split_whitespace();
    let command = parts.next().expect("Failed to parse input");
    let args = parts.collect::<Vec<&str>>();

    match command {
        "cd" => {
            let query_arg = args[0];
            let mut entries = fs::read_dir(current_dir)?
                .filter_map(|e| {
                    let entry = e.unwrap();
                    if !entry.metadata().unwrap().is_dir() {
                        return None;
                    }
                    let name = entry.path().to_str().unwrap().to_string();
                    let score = if let Some(score) = matcher.fuzzy_match(name.as_str(), query_arg) {
                        score
                    } else {
                        return None;
                    };
                    Some(Suggestion {
                        name,
                        score,
                        command: command.to_string(),
                    })
                })
                .collect::<Vec<Suggestion>>();
            suggestions.append(&mut entries);
        }
        command if !input.contains(" ") => {
            // list all the commands 😁
            let output = Command::new("bash")
                .args(&["-c", "compgen -A function -abck"])
                .output();
            if let Err(err) = output {
                println!("{}", err);
            } else {
                let mut commands = String::from_utf8(output.unwrap().stdout)?
                    .lines()
                    .filter_map(|line| {
                        let name = line.to_string();
                        let mut score =
                            if let Some(score) = matcher.fuzzy_match(name.as_str(), command) {
                                score
                            } else {
                                return None;
                            };
                        if name == command {
                            score += 100;
                        }
                        Some(Suggestion {
                            name,
                            score,
                            command: command.to_string(),
                        })
                    })
                    .collect::<Vec<Suggestion>>();

                suggestions.append(&mut commands);
            }
        }
        _ => (),
    }
    suggestions.sort_by(|a, b| b.score.cmp(&a.score));

    Ok(suggestions)
}
