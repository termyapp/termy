use crate::{
  paths::CrossPath,
  shell::{Cell, Data, ServerMessage, Status},
};
use anyhow::Result;
use indoc::formatdoc;
use log::info;

pub fn path(mut path: CrossPath, cell: Cell) -> Result<Status> {
  info!("Running path {:?}", path);
  path.canonicalize();

  if path.buf.is_dir() {
    info!("Changing directory to {}", path);
    cell.send(ServerMessage::new(
      Data::Mdx(formatdoc! {"
                <Card type='success'>New directory: <Path>{path}</Path></Card>
            ", path = path}),
      Some(vec![(String::from("cd"), path.to_string())]),
    ));

    return Ok(Status::Success);
  } else {
    // todo: default action for files (customizable in the future)

    return Ok(Status::Error);
  };
}
