use crate::util::dirs;
use anyhow::Result;
use log::LevelFilter;
use log4rs::append::{console::ConsoleAppender, file::FileAppender};
use log4rs::config::{Appender, Config, Root};
use log4rs::encode::pattern::PatternEncoder;
use std::fs::File;

// patterns: https://docs.rs/log4rs/1.0.0/log4rs/encode/pattern/index.html

pub fn init() -> Result<()> {
  let config = if cfg!(debug_assertions) {
    let console = ConsoleAppender::builder()
      .encoder(Box::new(PatternEncoder::new("{h({l})} | {m}{n}"))) // concurrently removes highlighting...
      .build();

    Config::builder()
      .appender(Appender::builder().build("console", Box::new(console)))
      .build(
        Root::builder()
          .appender("console")
          .build(LevelFilter::Trace),
      )?
  } else {
    // get log file path (~/.termy/log)
    let log_path = dirs::config().join("log");

    // create a new file on each init
    File::create(&log_path)?;

    let file = FileAppender::builder()
      .encoder(Box::new(PatternEncoder::new(
        "{d(%H:%M:%S)} | {h({l})} | {m}{n}",
      )))
      .build(log_path)?;

    Config::builder()
      .appender(Appender::builder().build("file", Box::new(file)))
      .build(Root::builder().appender("file").build(LevelFilter::Trace))?
  };

  log4rs::init_config(config)?;

  log::info!("Initialized logger");

  Ok(())
}
