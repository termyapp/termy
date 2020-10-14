use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    ViewCommand(ViewStruct),
    Prompt(PromptStruct),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ViewStruct {
    pub path: String,
    pub callback: String,
    pub error: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptStruct {
    pub input: String,
    pub current_dir: String,
    pub callback: String,
    pub error: String,
}
