import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

/**
 * use-wallet.ts — thin wrapper around the Solana wallet adapter.
 *
 * Returns a stable object that the IDE features can depend on
 * without importing wallet-adapter-react directly everywhere.
 */
export function useWallet() {
  const wallet = useSolanaWallet();

  return {
    connected: wallet.connected,
    connecting: wallet.connecting,
    publicKey: wallet.publicKey,
    publicKeyBase58: wallet.publicKey?.toBase58() ?? null,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    disconnect: wallet.disconnect,
  };
}
