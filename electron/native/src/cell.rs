use crate::{command::external::FrontendMessage, command::Command};
use crossbeam_channel::{Receiver, Sender};
use log::error;
use serde::{Deserialize, Serialize};

/// Synonymous with "Shell" or "CLI"
/// Naming it "Cell" makes it consistent with the frontend
/// Once we have a name for Termy's shell language, it might make sense to rename this
pub struct Cell {
    #[allow(dead_code)]
    id: String,
    current_dir: String,
    input: String,

    pub tsfn: ThreadsafeFunctionType,
    pub sender: Sender<CellChannel>,
    pub receiver: Receiver<CellChannel>,
}

impl Cell {
    pub fn new(
        props: CellProps,
        tsfn: ThreadsafeFunctionType,
        sender: Sender<CellChannel>,
        receiver: Receiver<CellChannel>,
    ) -> Self {
        let CellProps {
            id,
            current_dir,
            input,
        } = props;

        Self {
            id,
            current_dir,
            input,

            tsfn,
            sender,
            receiver,
        }
    }

    pub fn current_dir(&self) -> &str {
        self.current_dir.as_ref()
    }

    pub fn run(self) {
        self.send(ServerMessage::Status(Status::Running));

        // once operators (|, &&, ||) are introduced, this could become Vec<Command>
        let command = parse_input(&(self.input), &(self.current_dir));

        if let Err(err) = command.execute(self) {
            error!("Error while executing command: {}", err);
        };
    }

    pub fn send(&self, message: ServerMessage) {
        tsfn_send(&self.tsfn, message);
    }
}

type ThreadsafeFunctionType =
    napi::threadsafe_function::ThreadsafeFunction<std::vec::Vec<ServerMessage>>;

pub fn tsfn_send(tsfn: &ThreadsafeFunctionType, message: ServerMessage) {
    tsfn.call(
        Ok(vec![message]),
        napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
    );
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CellProps {
    id: String,
    current_dir: String,
    input: String,
}

pub enum CellChannel {
    FrontendMessage(FrontendMessage),
    Exit,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum ServerMessage {
    Output(Output),
    Status(Status),
    Error(String), // Custom error type?
}

impl ServerMessage {
    pub fn output(output_type: OutputType, action: Option<Action>) -> ServerMessage {
        ServerMessage::Output(Output {
            output_type,
            action,
        })
    }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Output {
    #[serde(flatten)]
    output_type: OutputType,
    action: Option<Action>,
}

#[derive(Serialize, Debug)]
pub struct Action {
    cd: String,
    theme: String,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum OutputType {
    Text(Vec<u8>), // pty (external commands) is always text, except when it starts with "<Termy" OR if it's being piped and can be parsed as JSON
    Api(String),
    Mdx(String), // same thing as api with cosmetic enhancements
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Status {
    Running,
    Success,
    Error,
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
