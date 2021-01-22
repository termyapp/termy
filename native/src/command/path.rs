use crate::cell::{Cell, Data, ServerMessage, Status};
use anyhow::Result;
use indoc::formatdoc;
use log::info;
use std::path::PathBuf;

pub fn path(path: &PathBuf, cell: Cell) -> Result<Status> {
    let path = path.canonicalize().expect("Failed to canonicalize path");
    info!("Running path: {}", path.display());

    if path.is_dir() {
        // cd to path

        cell.send(ServerMessage::new(
            Data::Mdx(formatdoc! {"
                <Card type='success'>New directory: <Path>{path}</Path></Card>
            ", path = path.to_string_lossy()}),
            Some(vec![(
                String::from("cd"),
                path.to_string_lossy().to_string(),
            )]),
        ));

        return Ok(Status::Success);
    } else if path.is_file() {
        // default action (customizable in the future)
        todo!()
    };

    info!("here :(");

    return Ok(Status::Error);
}
