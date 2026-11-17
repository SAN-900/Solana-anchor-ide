import type { CompileRequest, CompileResult } from '@solana-web-ide/compiler-core';

export type { CompileRequest, CompileResult };

/** Status of the WASM module load */
export type WasmLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface WasmCompilerOptions {
  /** URL to the .wasm blob. Defaults to /wasm/solana_compiler_bg.wasm */
  wasmUrl?: string;
  /** Timeout in ms for a single compile run. Default: 30_000 */
  timeoutMs?: number;
}
