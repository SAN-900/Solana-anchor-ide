let _module: WebAssembly.Module | null = null;
let _loading: Promise<WebAssembly.Module> | null = null;

const DEFAULT_WASM_URL = '/wasm/solana_compiler_bg.wasm';

/**
 * Lazy-load and cache the WASM module.
 * Safe to call from multiple places — only one fetch is ever in flight.
 */
export async function loadWasmModule(wasmUrl = DEFAULT_WASM_URL): Promise<WebAssembly.Module> {
  if (_module) return _module;
  if (_loading) return _loading;

  _loading = (async () => {
    const res = await fetch(wasmUrl);
    if (!res.ok) throw new Error(`Failed to fetch WASM: ${res.status} ${res.statusText}`);
    const bytes = await res.arrayBuffer();
    _module = await WebAssembly.compile(bytes);
    return _module;
  })();

  return _loading;
}

/** Returns true if the WASM module is already cached in memory. */
export function isWasmReady(): boolean {
  return _module !== null;
}
