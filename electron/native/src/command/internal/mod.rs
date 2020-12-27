// "theme" => {
//     let theme = if let Some(theme) = self.args.iter().next() {
//         Some(theme.clone())
//     } else {
//         None
//     };
//     Some(ServerMessage {
//         output: Some(Output {
//             data: ServerData::ApiData(formatdoc! {"
//                 <Card>Changed theme to <Path>{theme}</Path></Card>
//                 ", theme = theme.clone().unwrap()}),
//             cell_type: OutputType::Api,
//             cd: None,
//             theme,
//         }),
//         status: Some(Status::Success),
//     })
// }
// "home" => {
//     let home_dir = dirs::home_dir().unwrap().as_os_str().to_owned();
//     ServerMessage::api(
//         home_dir.to_string_lossy().to_string(),
//         None,
//         Status::Success,
//     )
// }
// root if root.chars().next().unwrap_or_default() == '/' => {
//     let path = RelativePath::new("").to_path(root);

//     if path.is_dir() {
//         ServerMessage::api(
//             formatdoc! {"
//                     <Card type='success'>New directory: <Path>{path}</Path></Card>
//                     ", path = path.to_string_lossy()},
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
// "cd" => {
//     // todo: absolute paths and /, ~, ...
//     let path = self.args.iter().next().unwrap();
//     let relative_path = RelativePath::new(path);
//     let cwd = RelativePath::new(&self.current_dir);
//     let absolute_path = if path.chars().next().unwrap_or_default() == '/' {
//         RelativePath::new("").to_path(path)
//     } else {
//         cwd.join_normalized(relative_path).to_path(Path::new(""))
//     };

//     if absolute_path.is_dir() {
//         ServerMessage::api(
//             format!(
//                 "Changed current directory to {}",
//                 absolute_path.to_string_lossy()
//             ),
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
// "move" => {
//     // move arg1 arg2
//     let mut args = self.args.iter();
//     let from = self.current_dir.clone() + args.next().unwrap();
//     let from = Path::new(&from);
//     let to = self.current_dir.clone() + args.next().unwrap();
//     let to = Path::new(&to);
//     from.canonicalize()?;
//     fs::rename(from, to)?;

//     ServerMessage::api("Moved file".to_owned(), None, Status::Success)
// }
// _ => None,
