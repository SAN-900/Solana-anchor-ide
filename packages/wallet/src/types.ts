import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

/** Minimal wallet interface used throughout the IDE - avoids direct adapter-react dep. */
export interface IdeWallet {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  disconnect(): Promise<void>;
}
