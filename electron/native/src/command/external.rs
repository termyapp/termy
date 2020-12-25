//    // Pty
//             // examples: https://github.com/wez/wezterm/tree/e2e46cb50d32562cdb02e0a8d309fa9f7fbbecf0/pty/examples
//             let command = self.command;
//             info!("running pty command: {}", command);
//             let pty_system = native_pty_system();
//             let mut pair = pty_system.openpty(PtySize {
//                 rows: 15,
//                 cols: 80,
//                 pixel_width: 0,
//                 pixel_height: 0,
//             })?;

//             let mut cmd = CommandBuilder::new(command);
//             cmd.env("LANG", "en_US.UTF-8");
//             cmd.env("TERM", "xterm-256color");
//             cmd.env("COLORTERM", "truecolor");
//             cmd.env("TERM_PROGRAM", "Termy");
//             cmd.env("TERM_PROGRAM_VERSION", "v0.1.3"); // todo: use a var here

//             cmd.cwd(self.current_dir);
//             cmd.args(self.args);
//             let mut child = pair.slave.spawn_command(cmd)?;

//             // Read and parse output from the pty with reader
//             let mut reader = pair.master.try_clone_reader()?;
//             let mut i = 0;
//             thread::spawn(move || {
//                 // let mut chunk = [0u8; 10000]; 6899
//                 // let mut chunk = [0u8; 1024]; 7086
//                 // let mut chunk = [0u8; 64]; 37651
//                 let mut chunk = [0u8; 1024];

//                 // todo: flowcontrol - pause here
//                 // https://xtermjs.org/docs/guides/flowcontrol/
//                 // also, buffer chunks to minimize ipc calls
//                 // can't read_exact because than programs that expect input won't work

//                 loop {
//                     let read = reader.read(&mut chunk);

//                     if let Ok(len) = read {
//                         if len == 0 {
//                             // todo: doesn't get here on windows
//                             break;
//                         }
//                         let chunk = &chunk[..len];
//                         i += 1;
//                         info!("Sending chunk: {} {}", i, chunk.len());
//                         let data = ServerData::PtyData(chunk.to_vec());
//                         send_message.send(ServerMessage {
//                             output: Some(Output {
//                                 data,
//                                 cell_type: CellType::Pty,
//                                 cd: None,
//                                 theme: None,
//                             }),
//                             status: None,
//                         });
//                     } else {
//                         error!("Err: {}", read.unwrap_err());
//                     }
//                 }
//                 if let Err(err) = sender.send(CellChannel::SendMessage(send_message)) {
//                     error!("Failed to pass send_message over: {}", err);
//                 };
//                 info!("Passed over send_message");
//             });

//             while child.try_wait()?.is_none() {
//                 // receive stdin message
//                 let received = receiver.recv();
//                 match received {
//                     Ok(CellChannel::FrontendMessage(FrontendMessage { id, stdin, size })) => {
//                         if let Some(message) = stdin {
//                             // Send data to the pty by writing to the master
//                             write!(pair.master, "{}", message).expect("Failed to write to master");

//                             info!("Stdin written: {:?}", message);
//                         } else if let Some(Size { rows, cols }) = size {
//                             pair.master
//                                 .resize(PtySize {
//                                     rows,
//                                     cols,
//                                     pixel_width: 0,
//                                     pixel_height: 0,
//                                 })
//                                 .expect("Failed to resize pty");

//                             info!("Resized pty: {} {}", rows, cols);
//                         } else {
//                             warn!("Invalid frontend message")
//                         }
//                     }
//                     Ok(CellChannel::SendMessage(send_message)) => {
//                         info!("Exiting");
//                         // portable_pty only has boolean support for now
//                         send_message.send(ServerMessage {
//                             output: None,
//                             status: Some(if child.wait().unwrap().success() {
//                                 Status::Success
//                             } else {
//                                 Status::Error
//                             }),
//                         });
//                         break;
//                     }
//                     _ => {
//                         error!("Received no message or error");
//                     }
//                 }
//             }
