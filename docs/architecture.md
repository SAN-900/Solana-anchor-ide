# Architecture

## Overview

Solana Web IDE is a browser-native IDE for writing, compiling, and deploying
Anchor/Solana programs. No local toolchain required — it runs entirely in the browser.

## Compile Paths

```
                        ┌─────────────────────────────┐
                        │      Browser (apps/web)      │
                        │                              │
   Edit Rust source ───►│  use-build.ts                │
                        │    1. try compiler-wasm ──►  │──► WASM (in-browser, ~200ms)
                        │    2. fallback: remote ────► │──► build-service (Docker anchor build)
                        └─────────────────────────────┘
```

**Primary:** `compiler-wasm` — Rust compiled to WebAssembly, runs off-thread in a Web Worker.
Works on Windows/Linux/Mac with zero local toolchain.

**Fallback:** `compiler-remote` → `apps/build-service` — Fastify server that runs
`anchor build` inside a Docker container. Used when the WASM compiler can't handle
the program (e.g., complex proc-macros), or during WASM development.

## RPC Flow

```
Browser → apps/rpc-proxy (Cloudflare Worker)
            ├── hides Helius/Triton API key
            ├── CORS allowlist
            └── per-IP rate limit
              └──► Helius devnet / Helius mainnet-beta
                └──► Triton (optional)

Browser → publicProvider (direct, for localnet)
```

## Deploy Flow

```
compiled .so (base64)
  └──► packages/deploy/loader.ts
        └──► BPFLoaderUpgradeable
              ├── create buffer account
              ├── write 900-byte chunks (packages/deploy/chunker.ts)
              └── deploy / upgrade program
```

## Package Dependency Graph

```
shared
  ├── compiler-core ──► compiler-wasm
  │                └──► compiler-remote
  ├── rpc
  ├── vfs
  ├── anchor-support ──► client-gen
  ├── deploy
  ├── wallet
  ├── dev-keys
  └── simulator

apps/web  ←── all packages above
apps/build-service  ←── compiler-core, shared
apps/rpc-proxy  (standalone)
```

## Feature-Slice Layout (apps/web/src/features/)

Each feature owns its UI, state store, and hooks vertically:

| Feature | Owns |
|---|---|
| `editor/` | Monaco editor, file tree, tabs, VFS sync |
| `build/` | Compile button, diagnostics panel, build store |
| `deploy/` | Cluster picker, keypair card, deploy progress |
| `idl/` | IDL viewer, instruction call forms |
| `test/` | In-browser test runner |
| `explorer/` | On-chain account + tx viewer |
| `accounts/` | Wallet balance, airdrop |
| `tx/` | Transaction builder + simulator |
| `settings/` | RPC provider, API keys |
