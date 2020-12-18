use anyhow::Result;
use logos::{Lexer, Logos};

// enum Command {
//     External,
//     BuiltIn,
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

fn text(lex: &mut Lexer<Token>) -> Result<Command> {
    Ok(Command::Arg)
}

#[derive(Debug, PartialEq)]
enum Command {
    BuiltIn,
    External,
    Arg,
}

#[derive(Logos, Debug, PartialEq)]
enum Token {
    #[token("create")]
    Create,

    #[token("move")]
    Move,

    #[regex(r"([\w\-\d]+)", text)]
    Text(Command),

    #[error]
    #[regex(r"\s+", logos::skip)]
    Error,
    // #[token("|")]
    // Pipe,

    // #[token("&&")]
    // And,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn works() {
        let mut command = Token::lexer("ls Downloads/Termy 1.0.app");

        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());

        let mut command = Token::lexer("create folder/package.json");

        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
        println!("{:#?}\n{}\n\n", command.next(), command.slice());
    }
}
