import type { Transaction, VersionedTransaction } from '@solana/web3.js';

export type SimulateTarget = Transaction | VersionedTransaction;

export interface SimulateResult {
  ok: boolean;
  logs: string[];
  unitsConsumed?: number;
  error?: string;
}
