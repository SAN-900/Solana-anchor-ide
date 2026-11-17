import type { CompileRequest, CompileResult } from '@solana-web-ide/compiler-core';
import { compileFailed } from '@solana-web-ide/compiler-core';
import type { RemoteCompilerConfig } from './types.js';

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_RETRIES = 2;

export async function remoteCompile(
  request: CompileRequest,
  config: RemoteCompilerConfig,
): Promise<CompileResult> {
  const { baseUrl, timeoutMs = DEFAULT_TIMEOUT_MS, maxRetries = DEFAULT_MAX_RETRIES } = config;
  const url = `${baseUrl}/build`;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`build-service returned ${res.status}: ${text}`);
      }

      const json = await res.json() as CompileResult;
      return json;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < maxRetries && !(err instanceof DOMException && err.name === 'AbortError')) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      } else {
        break;
      }
    }
  }

  throw compileFailed(
    [{ severity: 'error', message: `Remote compiler unreachable: ${lastErr}`, file: request.manifestPath }],
    lastErr,
  );
}
