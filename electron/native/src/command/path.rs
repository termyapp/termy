use crate::cell::{Cell, Data, ServerMessage, Status};
use anyhow::Result;
use indoc::formatdoc;
use log::info;
use std::path::PathBuf;

pub fn path(path: &PathBuf, cell: Cell) -> Result<Status> {
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

// root if root.chars().next().unwrap_or_default() == '/' => {
//     let path = RelativePath::new("").to_path(root);

//     if path.is_dir() {
//         ServerMessage::api(

//             Some(path.to_string_lossy().to_string()),
//             Status::Success,
//         )
//     } else {
//         ServerMessage::api(
//             format!("{} is not a valid directory", path.to_string_lossy()),
//             None,
//             Status::Error,
//         )
//     }
// }
// dir if RelativePath::new(&self.current_dir)
//     .join_normalized(RelativePath::new(dir))
//     .to_path(Path::new(""))
//     .is_dir() =>
// {
//     let path = dir;
//     let relative_path = RelativePath::new(path);
//     let cwd = RelativePath::new(&self.current_dir);
//     let absolute_path = cwd.join_normalized(relative_path).to_path(Path::new(""));

//     if absolute_path.is_dir() {
//         ServerMessage::api(
//             formatdoc! {"
//             <Card type='success'>Changed current directory to <Path>{path}</Path></Card>
//             ", path = absolute_path.to_string_lossy()},
//             Some(absolute_path.to_string_lossy().to_string()),
//             Status::Success,
//         )
//     } else {
//         ServerMessage::api(
//             format!(
//                 "{} is not a valid directory",
//                 absolute_path.to_string_lossy()
//             ),
//             None,
//             Status::Error,
//         )
//     }
// }
