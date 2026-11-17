import type { Cluster } from '@solana-web-ide/shared';
import type { Keypair, PublicKey } from '@solana/web3.js';

export interface DeployRequest {
  /** Base64-encoded .so binary produced by the compiler */
  programSoBase64: string;
  /** The program's upgrade authority keypair (or ephemeral for first deploy) */
  programKeypair: Keypair;
  /** Payer keypair or wallet public key */
  payerPublicKey: PublicKey;
  cluster: Cluster;
}

export interface DeployProgress {
  phase: 'creating-buffer' | 'writing-chunks' | 'deploying' | 'done' | 'failed';
  /** 0-100 */
  pct: number;
  message: string;
}

export interface DeployResult {
  ok: boolean;
  programId: string;
  signature?: string;
  error?: string;
}
