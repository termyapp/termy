use super::internal::view;
use crate::{
  paths::CrossPath,
  shell::{Cell, Data, ServerMessage, Status},
};
use anyhow::Result;
use log::info;

pub fn path(mut path: CrossPath, cell: Cell) -> Result<Status> {
  info!("Running path {:?}", path);
  path.canonicalize();

  if path.buf.is_dir() {
    info!("Changing directory to {}", path);
    let path_clone = path.to_string();

    cell.send(ServerMessage::new(
      Data::Mdx(view::view(path).unwrap()),
      Some(vec![(String::from("cd"), path_clone)]),
    ));

    return Ok(Status::Success);
  } else {
    // todo: default action for files (customizable in the future)

    return Ok(Status::Error);
  };
}
