/**
 * bridge.ts — thin JS wrapper over the wasm-bindgen generated bindings.
 *
 * The actual generated code lives in src/wasm-bindgen/ (produced by
 * `pnpm build:wasm`). This file re-exports only the surface we need so
 * the rest of the codebase never imports wasm-bindgen directly.
 *
 * During development (before the WASM is compiled), this module stubs
 * every export so TypeScript compilation always succeeds.
 */

export interface WasmCompileInput {
  source: string;
  programName: string;
  cluster: 'localnet' | 'devnet' | 'mainnet-beta';
}

export interface WasmCompileOutput {
  ok: boolean;
  /** Base64-encoded .so if ok === true */
  soBase64?: string;
  /** Anchor IDL JSON string if ok === true */
  idlJson?: string;
  diagnosticsJson: string; // JSON array of WireDiagnostic
  durationMs: number;
}

/**
 * Call the WASM compiler synchronously (runs on a Worker, so it may block).
 * This is the raw FFI boundary — use the higher-level `compile()` from index.ts.
 */
export declare function wasmCompile(input: WasmCompileInput): WasmCompileOutput;
