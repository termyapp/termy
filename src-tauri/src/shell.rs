use anyhow::Result;
use base64::{decode, encode};
use fs::File;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use io::Read;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::{
    env,
    ffi::OsStr,
    fs,
    io::{self, BufRead, BufReader},
    path::Path,
};
use subprocess::Exec;
use tauri::WebviewMut;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LsOutput {
    path: String,
    file_name: String,
    is_dir: bool,
    is_file: bool,
}

#[derive(Serialize, Debug)]
pub struct ShellResult {
    id: String,
    stdin: String,
    stdout: String,
    stderr: String,
}

pub fn shell(
    webview: &mut WebviewMut,
    input: String,
    current_dir: String,
    id: String,
) -> Result<()> {
    println!("Running command: `{}` in {}", input, current_dir);

    let mut parts = input.trim().split_whitespace();
    let command = parts.next().expect("Failed to parse input");
    let args = parts.map(OsStr::new).collect::<Vec<&OsStr>>();

    let mut shell_result = ShellResult {
        id,
        stdin: input.to_string(),
        stdout: "".to_string(),
        stderr: "".to_string(),
    };

    match command {
        "ls" => {
            let mut entries = fs::read_dir(current_dir)?
                .map(|res| {
                    res.map(|e| LsOutput {
                        path: e.path().to_str().unwrap().to_string(),
                        is_dir: e.metadata().unwrap().is_dir(),
                        file_name: e.file_name().to_str().unwrap().to_string(),
                        is_file: e.file_type().unwrap().is_file(),
                    })
                })
                .collect::<Result<Vec<_>, io::Error>>()?;
            shell_result.stdout = serde_json::to_string(&entries)?;
        }
        command => {
            env::set_current_dir(&current_dir)?;

            let mut p = Exec::cmd(command).args(&args).stream_stdout()?;

            let reader = BufReader::new(p);

            reader.lines().for_each(|line| match line {
                Ok(out) => {
                    shell_result.stdout += &format!("{}\n", out);
                }
                Err(err) => {
                    shell_result.stderr += err.to_string().as_ref();
                }
            });
        }
    }

    if shell_result.stderr.len() > 0 {
        println!("Error: {}", shell_result.stderr);
    } else {
        println!("Out: {:?}", shell_result.stdout)
    }

    tauri::event::emit(webview, "event", Some(shell_result)).expect("Failed to send event");

    Ok(())
}

/*
use futures::StreamExt;
use io::{BufRead, BufReader, Error, ErrorKind};
use serde::Serialize;
use std::process::{Command, Stdio};
use std::{
    env,
    ffi::{OsStr, OsString},
    fs,
    io::{self, Write},
    time::Duration,
};
use subprocess::Exec;
use tauri::event::on_event;

#[derive(Serialize, Debug)]
pub struct TermyOut {
    stdin: String,
    stdout: String,
    sterr: String,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LsOutput {
    path: String,
    file_name: String,
    is_dir: bool,
    is_file: bool,
}

// pub fn shell(mut input: String, current_dir: &str,) -> io::Result<TermyOut> {
//     let mut parts = input.trim().split_whitespace();
//     let command = parts.next().unwrap();
//     let mut args = parts;

//     Ok(match command {
//         "cd" => TermyOut {
//             stdin: input,
//             stdout: String::from(""),
//             sterr: String::from(""),
//         },
//         "ls" => {
//             let mut entries = fs::read_dir(current_dir)?
//                 .map(|res| {
//                     res.map(|e| LsOutput {
//                         path: e.path().to_str().unwrap().to_string(),
//                         is_dir: e.metadata().unwrap().is_dir(),
//                         file_name: e.file_name().to_str().unwrap().to_string(),
//                         is_file: e.file_type().unwrap().is_file(),
//                     })
//                 })
//                 .collect::<Result<Vec<_>, io::Error>>()?;
//             let stdout = serde_json::to_string(&entries)?;
//             TermyOut {
//                 stdin: input,
//                 stdout,
//                 sterr: String::from(""),
//             }
//         }
//         command => {
//             // todo: childprocesses? don't work (vi, ssh, ...)
//             // look up how hyper does it
//             // current process is tauri's main process. maybe create a new one for the shell? a child process?
//             let mut child = Command::new(command)
//                 .current_dir(current_dir)
//                 .args(args)
//                 .stdout(Stdio::piped())
//                 .spawn()
//                 .expect("cannot spawn");

//             TermyOut {
//                 stdin: "input".to_string(),
//                 stdout: String::from(""),
//                 sterr: String::from(""),
//             }

//             // match child {
//             //     Ok(mut child) => TermyOut {
//             //         stdin: input,
//             //         stdout: String::from_utf8(child.stdout).unwrap(),
//             //         sterr: String::from_utf8(child.stderr).unwrap(),
//             //     },
//             //     Err(e) => TermyOut {
//             //         stdin: input,
//             //         stdout: String::from(""),
//             //         sterr: String::from(e.to_string()),
//             //     },
//             // }
//         }
//     })
// }

// https://stackoverflow.com/questions/34611742/how-do-i-read-the-output-of-a-child-process-without-blocking-in-rust
// #[tokio::main]
// async fn tokio_test(mut input: String, current_dir: &str) -> io::Result<TermyOut> {
//     let mut parts = input.trim().split_whitespace();
//     let command = parts.next().unwrap();
//     let mut args = parts;

//     Ok(match command {
//         command => {
//             let mut child = Command::new(command)
//                 .current_dir(current_dir)
//                 .args(args)
//                 .stdout(Stdio::piped())
//                 .spawn()
//                 .expect("cannot spawn");

//             println!("");
//             let stdout = child.stdout.take().expect("sht");

//             // let result: Vec<_> = BufReader::new(stdout)
//             //     .lines()
//             //     .inspect(|s| println!("> {:?}", s))
//             //     .collect()
//             //     .await;

//             println!("All the lines: {:?}", stdout);
//             println!("");

//             TermyOut {
//                 stdin: "input".to_string(),
//                 stdout: String::from(""),
//                 sterr: String::from(""),
//             }
//         }
//     })
// }

// pub fn pipes_test(mut input: String, current_dir: &str) -> io::Result<()> {
//     let mut parts = input.trim().split_whitespace();
//     let command = parts.next().unwrap();
//     let mut args = parts;

//     match command {
//         command => {
//             let mut stdout = std::process::Command::new(command)
//                 .current_dir(current_dir)
//                 .args(args)
//                 .stdout(Stdio::piped())
//                 .spawn()?
//                 .stdout
//                 .ok_or_else(|| {
//                     Error::new(ErrorKind::Other, "Could not capture standard output.")
//                 })?;
//             println!("out {:?}", stdout);
//             // {
//             //     println!("Here");
//             //     let child_stdin = child.stdin.as_mut().unwrap();
//             //     child_stdin.write_all(b"Hello, world!\n")?;
//             // }

//             let reader = BufReader::new(stdout);

//             reader
//                 .lines()
//                 .filter_map(|line| line.ok())
//                 .for_each(|line| println!("{}", line));
//         }
//     }
//     Ok(())
// }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn list_src() {
        assert_eq!(
            termy(
                "ls".to_string(),
                "/Users/martonlanga/code/termy/src-tauri/src"
            )
            .unwrap()
            .stdout,
            "[{\"path\":\"/Users/martonlanga/code/termy/src-tauri/src/termy.rs\",\"file_name\":\"termy.rs\",\"is_dir\":false,\"is_file\":true},{\"path\":\"/Users/martonlanga/code/termy/src-tauri/src/cmd.rs\",\"file_name\":\"cmd.rs\",\"is_dir\":false,\"is_file\":true},{\"path\":\"/Users/martonlanga/code/termy/src-tauri/src/build.rs\",\"file_name\":\"build.rs\",\"is_dir\":false,\"is_file\":true},{\"path\":\"/Users/martonlanga/code/termy/src-tauri/src/main.rs\",\"file_name\":\"main.rs\",\"is_dir\":false,\"is_file\":true}]".to_string()
        );
    }

    // #[test]
    // fn process() {
    //     let result = subprocess_test(
    //         "vi".to_string(),
    //         "/Users/martonlanga/code/termy/src-tauri/src",
    //     );
    //     // let result = tokio_test(
    //     //     "echo asd".to_string(),
    //     //     "/Users/martonlanga/code/termy/src-tauri/src",
    //     // )
    //     // .unwrap();
    //     // // println!("{:?}", result);
    //     assert_eq!(result.unwrap(), ());
    // }
}
*/
