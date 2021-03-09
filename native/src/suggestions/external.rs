// todo: index these during init
// fn zsh_history(&mut self) {
//   // bash: ~/.bash_history
//   // fish: ~/.local/share/fish/fish_history
//   // zsh: /.zsh_history
//   if let Ok(lines) =
//     read_lines(dirs::home_dir().unwrap().to_string_lossy().to_string() + "/.zsh_history")
//   {
//     for line in lines {
//       if let Ok(line) = line {
//         if let Some(command) = line.split(";").last() {
//           let command = command.to_string();
//           if let Some((score, _)) = self.matcher.fuzzy_indices(&command, self.value.as_ref()) {
//             let label =
//               String::from(&command[find_common_words_index(self.value.as_ref(), &command)..]);
//             self.insert(
//               command.clone(),
//               Suggestion {
//                 insert_text: Some(label.clone()),
//                 label,
//                 score: score - Priority::High as i64,
//                 kind: SuggestionType::ExternalHistory,
//                 documentation: None,
//                 date: None,
//               },
//             );
//           }
//         }
//       }
//     }
//   }
// }
