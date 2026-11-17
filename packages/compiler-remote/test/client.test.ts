import { describe, it, expect } from 'vitest';
import { remoteCompile } from '../src/index.js';

describe('compiler-remote client', () => {
  it('throws SolanaWebIdeError on network failure', async () => {
    await expect(
      remoteCompile(
        {
          runId: 'test-run',
          manifestPath: 'Anchor.toml',
          files: {},
          cluster: 'devnet',
        },
        { baseUrl: 'http://localhost:99999', timeoutMs: 500, maxRetries: 0 },
      ),
    ).rejects.toThrow();
  });
});
