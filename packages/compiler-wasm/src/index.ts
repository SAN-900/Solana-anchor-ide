/**
 * @solana-web-ide/compiler-wasm
 *
 * Browser-native Anchor compiler powered by WebAssembly.
 * This is the PRIMARY compile path. Falls back to compiler-remote when unavailable.
 *
 * Usage:
 *   import { compile, isReady, preload } from '@solana-web-ide/compiler-wasm';
 *
 *   await preload(); // optional — start loading WASM before first compile
 *   const result = await compile(request);
 */

export { loadWasmModule, isWasmReady } from './loader.js';
export type { WasmCompilerOptions, WasmLoadStatus } from './types.js';

import type { CompileRequest, CompileResult } from '@solana-web-ide/compiler-core';
import { validateCompileRequest } from '@solana-web-ide/compiler-core';
import { loadWasmModule } from './loader.js';
import type { WasmCompilerOptions } from './types.js';

/**
 * Preload the WASM module in the background.
 * Call this on app startup so the first compile is instant.
 */
export async function preload(opts?: WasmCompilerOptions): Promise<void> {
  await loadWasmModule(opts?.wasmUrl);
}

/**
 * Compile a Solana/Anchor program to a BPF .so using the in-browser WASM compiler.
 *
 * @throws {SolanaWebIdeError} with code INVALID_INPUT if request is malformed
 * @throws {SolanaWebIdeError} with code COMPILE_TIMEOUT if compile exceeds timeoutMs
 */
export async function compile(
  request: CompileRequest,
  opts?: WasmCompilerOptions,
): Promise<CompileResult> {
  validateCompileRequest(request);
  await loadWasmModule(opts?.wasmUrl);

  // TODO: delegate to compiler.worker.ts (off main thread) and call wasmCompile()
  // For now, return a typed stub so the rest of the app can be wired up.
  return {
    ok: false,
    runId: request.runId,
    diagnostics: [{ severity: 'error', message: 'WASM compiler not yet built. Use remote fallback.', file: request.manifestPath }],
    durationMs: 0,
    backend: 'wasm',
  } as CompileResult;
}
