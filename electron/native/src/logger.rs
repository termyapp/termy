use anyhow::Result;
use log::LevelFilter;
use log4rs::append::{console::ConsoleAppender, file::FileAppender};
use log4rs::config::{Appender, Config, Root};
use log4rs::encode::pattern::PatternEncoder;

pub fn init() -> Result<()> {
    // todo: create ~/termy folder and put log inside there & delete it on each init
    // let file = FileAppender::builder()
    //   .encoder(Box::new(PatternEncoder::new(
    //     "{d(%Y-%m-%d %H:%M:%S)} {l} - {m}{n}",
    //   ))) // https://docs.rs/log4rs/0.13.0/log4rs/encode/pattern/index.html
    //   .build(dirs::home_dir().unwrap().to_string_lossy().to_string() + "/.termy.log")?;

    let console = ConsoleAppender::builder()
        .encoder(Box::new(PatternEncoder::new("{h({l})} - {m}{n}"))) // concurrently removes highlighting...
        .build();

    let config = Config::builder()
        // .appender(Appender::builder().build("logfile", Box::new(file)))
        .appender(Appender::builder().build("console", Box::new(console)))
        .build(
            Root::builder()
                // .appender("logfile")
                .appender("console")
                .build(LevelFilter::Info),
        )?;

    log4rs::init_config(config)?;

    log::info!("Initialized logger");

    Ok(())
}
