use neon::prelude::*;

fn event(mut cx: FunctionContext, message: &str) -> JsResult<JsString> {
    println!("message: {}", message);

    /// switch
    ///   suggestions
    ///   view custom command
    ///   process (start / in / out / stop)
    Ok(cx.string("hello node"))
}

register_module!(mut cx, { cx.export_function("event", event) });
