use crate::{command::Command, ThreadSafeFn};
use anyhow::Result;
use crossbeam_channel::{Receiver, Sender};
use indoc::{formatdoc, indoc};
use io::Read;
use log::{error, info, warn};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use relative_path::RelativePath;
use serde::{Deserialize, Serialize};
use std::io;
use std::path::Path;
use std::thread;
use std::{fs, io::Write};

/// Synonymous with "Shell" or "CLI"
/// Naming it "Cell" makes it consistent with the frontend
/// Once we have a name for Termy's shell language, it might make sense to rename this
pub struct Cell {
    props: CellProps,
    command: Command, // once operators (|, &&, ||) are introduced, this could become Vec<Command>
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CellProps {
    id: String,
    current_dir: String,
    input: String,
}

pub struct Communication {
    tsfn: ThreadSafeFn,
    receiver: Receiver<CellChannel>,
    sender: Sender<CellChannel>,
}

pub enum CellChannel {
    ThreadSafeFn(ThreadSafeFn),
    FrontendMessage(FrontendMessage),
}

impl Cell {
    pub fn new(props: CellProps) -> Cell {
        Cell {
            command: parse_input(&(props.input), &(props.current_dir)),
            props,
        }
    }

    pub fn run(
        &self,
        tsfn: ThreadSafeFn,
        receiver: Receiver<CellChannel>,
        sender: Sender<CellChannel>,
    ) {
        let communication = Communication {
            tsfn,
            receiver,
            sender,
        };

        if let Err(err) = self.command.execute(&self.props, communication) {
            error!("Error while executing command: {}", err);
        };

        info!(
            "Finished running cell `{}` with input {}",
            self.props.id, self.props.input
        );
    }
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Size {
    rows: u16,
    cols: u16,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FrontendMessage {
    id: String,
    stdin: Option<String>,
    size: Option<Size>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum ServerMessage {
    Output(Output),
    Status(Status),
    Error(String), // Custom error type?
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Output {
    #[serde(rename = "type")] // `type` is a reserved token...
    output_type: CellType,
    action: Option<Action>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum CellType {
    Text, // pty (external commands) is always text, except when it starts with "<Termy" OR if it's being piped and can be parsed as JSON
    Structured(Structured),
}

#[derive(Serialize, Debug)]
enum Structured {
    Api,
    Mdx, // same thing as api with cosmetic enhancements
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
enum Status {
    Running,
    Success,
    Error,
}

#[derive(Serialize, Debug)]
struct Action {
    cd: String,
    theme: String,
}

fn parse_input(input: &str, current_dir: &str) -> Command {
    let mut tokens = tokenize_input(input);

    Command::new(tokens.remove(0), tokens, current_dir)
}

fn tokenize_input(input: &str) -> Vec<String> {
    let mut inside_quotes = false;
    let mut tokens: Vec<String> = vec![];
    let mut token = String::new();

    for c in input.chars() {
        if c == '"' {
            inside_quotes = !inside_quotes;
        } else if c.is_whitespace() && !inside_quotes {
            tokens.push(token.clone());
            token.clear();
        } else {
            token.push(c);
        }
    }
    tokens.push(token);

    tokens
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tokenizes_input() {
        assert_eq!(
            tokenize_input("command arg1 arg2"),
            vec![
                "command".to_string(),
                "arg1".to_string(),
                "arg2".to_string(),
            ]
        );

        assert_eq!(
            tokenize_input("create \"Whitespace inside quotes yay'\""),
            vec![
                "create".to_string(),
                "Whitespace inside quotes yay'".to_string()
            ]
        );
    }
}
