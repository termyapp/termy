use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::Result;
use rusqlite::{Connection, NO_PARAMS};

fn connect() -> Connection {
    Connection::open("termy.db").unwrap()
}

pub fn init() -> Result<()> {
    let conn = connect();

    conn.execute(
        "create table if not exists commands (
                id integer primary key,
                current_dir text not null,
                input text not null,
                creation_date text not null,
             )",
        NO_PARAMS,
    )?;

    Ok(())
}

pub fn add_command(current_dir: &str, input: &str) -> Result<()> {
    let conn = connect();

    let creation_date = SystemTime::now()
        .duration_since(UNIX_EPOCH)?
        .as_millis()
        .to_string();

    conn.execute(
        "INSERT INTO commands (current_dir, input, creation_date) values (?1, ?2, ?3)",
        &[current_dir, input, &creation_date],
    )?;

    Ok(())
}

pub fn get_commands() -> Result<Vec<Command>> {
    let conn = connect();

    let mut stmt = conn.prepare("SELECT commands.command from commands;")?;

    let commands = stmt.query_map(NO_PARAMS, |row| Ok(Command { input: row.get(0)? }))?;

    let commands = commands.filter_map(|command| command.ok()).collect();

    Ok(commands)
}

pub struct Command {
    input: String,
}
