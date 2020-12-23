use anyhow::{bail, Result};
use logos::{Lexer, Logos};

use crate::util::get_executables;

// enum Command {
//     External,
//     Internal,
// }

// enum ServerMessage {
//     Output(Output),
//     Status(Status),
// }

// struct Output {
//     #[serde(rename = "type")]
//     cell_type: CellType,
//     data: Option<String>,
//     error: Option<String>,
//     action: Option<Action>,
// }

// #[derive(Serialize, Debug)]
// #[serde(rename_all = "camelCase")]
// pub enum CellType {
//     Text, // pty (external commands) is always text, except when it starts with "<Termy" OR if it's being piped and can be parsed as JSON
//     Structured(Structured),
// }

// enum Structured (
//     Api,
//     Mdx // same thing as api with cosmetic enhancements
// )

// #[derive(Serialize, Debug)]
// #[serde(rename_all = "camelCase")]
// enum Status {
//     Running,
//     Success,
//     Error,
// }

// struct Action {
//     cd: String,
//     theme: String,
// }

// trait Executable {
//     fn execute(&self, args: Vec<String>) -> Result<()>;
// }

// impl Executable for Command {
//     fn execute(&self, args: Vec<String>) -> Result<()> {
//         todo!()
//         // match self {
//         //     Command::Read => todo!(),
//         //     Command::Write => todo!(),
//         // }
//     }
// }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn works() {}
}
