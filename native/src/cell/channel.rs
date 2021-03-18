use super::{external::CellChannel, Message};
use crossbeam_channel::{unbounded, Receiver, Sender};
use napi::{CallContext, JsFunction, JsUnknown};

pub struct Channel {
  pub tsfn: ThreadsafeFunction,
  pub sender: Sender<CellChannel>,
  pub receiver: Receiver<CellChannel>,
}

impl Channel {
  pub fn new(ctx: &CallContext, js_function: JsFunction) -> Self {
    let tsfn = ThreadsafeFunction::new(&ctx, js_function);
    let (sender, receiver) = unbounded::<CellChannel>();

    Self {
      tsfn,
      sender,
      receiver,
    }
  }
}

pub struct ThreadsafeFunction(napi::threadsafe_function::ThreadsafeFunction<Vec<Message>>);

impl ThreadsafeFunction {
  fn new(ctx: &CallContext, js_function: JsFunction) -> Self {
    Self(
      ctx
        .env
        .create_threadsafe_function(
          &js_function,
          0,
          |ctx: napi::threadsafe_function::ThreadSafeCallContext<Vec<Message>>| {
            ctx
              .value
              .iter()
              .map(|arg| ctx.env.to_js_value(&arg))
              .collect::<napi::Result<Vec<JsUnknown>>>()
          },
        )
        .unwrap(),
    )
  }

  pub fn send_one(&self, message: Message) -> napi::Status {
    self.0.call(
      Ok(vec![message]),
      napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
    )
  }

  pub fn send(&self, messages: Vec<Message>) -> napi::Status {
    self.0.call(
      Ok(messages),
      napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking,
    )
  }
}

impl Clone for ThreadsafeFunction {
  fn clone(&self) -> Self {
    Self(
      self
        .0
        .try_clone()
        .expect("Failed to clone threadsafe function"),
    )
  }
}
