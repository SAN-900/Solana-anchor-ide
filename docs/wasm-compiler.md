# WASM Compiler

The browser-native compiler runs entirely client-side using WebAssembly,
with no server round-trip. Target: **hundreds of milliseconds** per compile.

## How It Works

```
Rust source (in browser)
  └──► compiler.worker.ts (Web Worker — off main thread)
        └──► packages/compiler-wasm/src/index.ts
              └──► wasm-bindgen JS bridge
                    └──► native/solana-compiler-frontend (Rust → WASM)
                          ├── syn: parse Rust AST
                          ├── anchor: expand macros
                          └── llvm-bpf: emit .so
```

## Build Steps

### 1. Install Rust + wasm-pack
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install wasm-pack
```

### 2. Build the WASM blob
```bash
cd packages/compiler-wasm
pnpm build:wasm
# Output: src/wasm-bindgen/ + ../../apps/web/public/wasm/
```

### 3. Run the web app
```bash
pnpm dev  # wasm blob served from /wasm/
```

## Status

| Component | Status |
|---|---|
| `packages/compiler-wasm/src/` | Complete (TypeScript API scaffolded) |
| `packages/compiler-wasm/rust/` | In progress (wasm-bindgen stub) |
| `native/solana-compiler-frontend/` | Planned (Rust frontend) |
| `native/llvm-bpf/` | Planned (LLVM BPF backend) |

## Fallback

When the WASM compiler is unavailable or times out, `use-build.ts` automatically
falls back to `compiler-remote` → `apps/build-service` (Docker + native Anchor).
The user sees the same UI either way; only the backend label in the status bar differs.
