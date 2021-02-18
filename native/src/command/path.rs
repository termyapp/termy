use crate::{
  paths::CrossPath,
  shell::{Cell, Data, ServerMessage, Status},
};
use anyhow::Result;
use indoc::formatdoc;
use log::info;

pub fn path(mut path: CrossPath, cell: Cell) -> Result<Status> {
  info!("Running path: {}", path);
  path.canonicalize();
  info!("Running path2: {}", path);

  if path.buf.is_dir() {
    let a = path.to_string();
    info!("asdfdfsdfs: {} {}", path, a);
    // change current dir to path
    cell.send(ServerMessage::new(
      Data::Mdx(formatdoc! {"
                <Card type='success'>New directory: <Path>{path}</Path></Card>
            ", path = path}),
      Some(vec![(String::from("cd"), a)]),
    ));

    return Ok(Status::Success);
  } else {
    // todo: default action for files (customizable in the future)

    return Ok(Status::Error);
  };
}
