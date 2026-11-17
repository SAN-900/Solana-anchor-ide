import type { Connection } from '@solana/web3.js';
import type { DeployRequest, DeployProgress, DeployResult } from './types.js';
import { decodeProgram, chunkProgram } from './chunker.js';

/**
 * Deploy a Solana program using BPFLoaderUpgradeable.
 *
 * Calls `onProgress` for each phase so the UI can show a progress bar.
 * This is the core deploy implementation — wired into the `deploy` feature in Step 11.
 *
 * @param request  - Compile output + keypairs
 * @param connection - web3.js Connection (from rpc package)
 * @param signTransaction - Wallet adapter sign function
 * @param onProgress - Progress callback
 */
export async function deployProgram(
  request: DeployRequest,
  connection: Connection,
  _signTransaction: (tx: unknown) => Promise<unknown>,
  onProgress: (p: DeployProgress) => void,
): Promise<DeployResult> {
  onProgress({ phase: 'creating-buffer', pct: 5, message: 'Creating program buffer account...' });

  const programBytes = decodeProgram(request.programSoBase64);
  const chunks = chunkProgram(programBytes);

  void connection; // used in full impl
  void chunks;

  // TODO: implement full BPFLoaderUpgradeable flow in Phase 2
  onProgress({ phase: 'failed', pct: 0, message: 'Deploy not yet implemented (Phase 2)' });

  return {
    ok: false,
    programId: request.programKeypair.publicKey.toBase58(),
    error: 'Deploy implementation is Phase 2',
  };
}
