/**
 * compiler.worker.ts
 *
 * Runs the WASM compiler off the main thread to keep the UI responsive.
 * Receives CompileRequest messages, runs compile(), posts CompileResult back.
 *
 * Usage (from main thread):
 *   const worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' });
 *   worker.postMessage(request);
 *   worker.onmessage = (e) => console.log(e.data); // CompileResult
 */

import type { CompileRequest } from '@solana-web-ide/compiler-core';
// import { compile } from '@solana-web-ide/compiler-wasm'; // Phase 1

self.onmessage = async (e: MessageEvent<CompileRequest>) => {
  const request = e.data;
  // TODO: call compile(request) from compiler-wasm when WASM is built
  const result = {
    ok: false,
    runId: request.runId,
    diagnostics: [{ severity: 'error' as const, message: 'WASM worker not yet implemented', file: request.manifestPath }],
    durationMs: 0,
    backend: 'wasm' as const,
  };
  self.postMessage(result);
};
