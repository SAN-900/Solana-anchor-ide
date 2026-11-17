use wasm_bindgen::prelude::*;

/// Top-level WASM entry point.
/// Input and output are JSON strings to avoid complex FFI types.
#[wasm_bindgen]
pub fn wasm_compile(input_json: &str) -> String {
    // TODO: parse input_json -> CompileInput, run anchor pipeline, return CompileOutput JSON
    let output = serde_json::json!({
        "ok": false,
        "diagnosticsJson": "[]",
        "durationMs": 0,
    });
    output.to_string()
}
