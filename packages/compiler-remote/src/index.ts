/**
 * @solana-web-ide/compiler-remote
 *
 * HTTP client for the build-service (apps/build-service).
 * This is the FALLBACK compile path when compiler-wasm is unavailable.
 *
 * Usage:
 *   import { remoteCompile } from '@solana-web-ide/compiler-remote';
 *   const result = await remoteCompile(request, { baseUrl: 'http://localhost:8788' });
 */
export { remoteCompile } from './client.js';
export type { RemoteCompilerConfig } from './types.js';
