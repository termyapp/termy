#[macro_use]
extern crate napi_derive;
#[macro_use]
extern crate lazy_static;
use cell::{
  channel::Channel,
  external::{CellChannel, FrontendMessage},
  Cell,
};
use crossbeam_channel::Sender;
use log::{error, info};
use napi::{
  CallContext, JsExternal, JsFunction, JsObject, JsString, JsUndefined, JsUnknown, Result,
};
use std::thread;
use suggestions::Suggestions;

mod cell;
mod logger;
mod suggestions;
mod util;

#[module_exports]
fn init(mut exports: JsObject) -> Result<()> {
  exports.create_named_method("getSuggestions", get_suggestions)?;

  exports.create_named_method("api", api)?;

  exports.create_named_method("runCell", run_cell)?;

  exports.create_named_method("frontendMessage", frontend_message)?;

  logger::init().unwrap();

  Ok(())
}

#[js_function(2)]
fn get_suggestions(ctx: CallContext) -> napi::Result<JsObject> {
  let current_dir = ctx.get::<JsString>(0)?.into_utf8()?.into_owned()?;
  let value = ctx.get::<JsString>(1)?.into_utf8()?.into_owned()?;

  info!("Getting suggestions for {}", value);

  let suggestions = Suggestions(current_dir, value);

  ctx.env.spawn(suggestions).map(|a| a.promise_object())
}

#[js_function(1)]
fn api(ctx: CallContext) -> napi::Result<JsUnknown> {
  let cell: Cell = ctx.env.from_js_value(ctx.get::<JsUnknown>(0)?)?;

  info!("Api call: {} {}", cell.current_dir, cell.value);

  ctx.env.to_js_value(&cell.api().unwrap())
}

#[js_function(5)]
fn run_cell(ctx: CallContext) -> napi::Result<JsExternal> {
  let cell: Cell = ctx.env.from_js_value(ctx.get::<JsUnknown>(0)?)?;
  let js_function = ctx.get::<JsFunction>(1)?;

  let channel = Channel::new(&ctx, js_function);
  let external_sender = channel.sender.clone();

  info!("Running cell: {:?}", cell);

  thread::spawn(move || {
    if let Err(err) = cell.run(channel) {
      error!("Errow while running cell: {:?}", err);
    }
  });

  ctx.env.create_external(external_sender)
}

#[js_function(2)]
fn frontend_message(ctx: CallContext) -> napi::Result<JsUndefined> {
  let attached_obj = ctx.get::<JsExternal>(0)?;
  let sender = ctx
    .env
    .get_value_external::<Sender<CellChannel>>(&attached_obj)?;

  let message: FrontendMessage = ctx.env.from_js_value(ctx.get::<JsUnknown>(1)?)?;

  info!("Frontend message: {:?}", message);

  if let Err(err) = sender.send(CellChannel::FrontendMessage(message)) {
    info!("Failed to send key: {}", err);
  }

  ctx.env.get_undefined()
}
