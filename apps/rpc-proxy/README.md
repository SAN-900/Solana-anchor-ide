# rpc-proxy

Edge function that sits between the browser IDE and Helius RPC.

## Why

Browsers enforce CORS. Solana RPC providers do not set CORS headers on
their mainnet endpoints. Without a proxy, the IDE cannot call RPC.

Additionally, embedding an API key in client-side code is a leak. This
worker holds the key server-side and exposes only two routes:

- `POST /devnet`
- `POST /mainnet-beta`

## Local development

    cp .dev.vars.example .dev.vars
    # edit .dev.vars with a real Helius key
    pnpm --filter @solana-web-ide/rpc-proxy dev

Then test:

    curl -s -X POST http://localhost:8787/devnet \
      -H 'Content-Type: application/json' \
      -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' | jq

Expected: `{"jsonrpc":"2.0","result":"ok","id":1}`

## Deployment

    wrangler secret put HELIUS_API_KEY
    pnpm --filter @solana-web-ide/rpc-proxy deploy

## Scope

- Adds CORS headers
- Holds the shared Helius key
- Rate limits per IP (best-effort)
- Does NOT handle BYO keys — clients with their own key talk to Helius directly

## Cost control

The shared key is on Helius's free tier. If traffic grows, upgrade the
Helius plan or move to per-user keys. Monitor with `wrangler tail`.