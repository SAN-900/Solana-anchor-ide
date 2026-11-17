import { Keypair } from '@solana/web3.js';

const LS_KEY = 'solana-web-ide:dev-keypair';

/** Load or create a persistent dev keypair from localStorage (devnet/localnet only). */
export function getOrCreateDevKeypair(): Keypair {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) {
    try {
      const bytes = Uint8Array.from(JSON.parse(stored) as number[]);
      return Keypair.fromSecretKey(bytes);
    } catch {
      // corrupted — regenerate
    }
  }
  const kp = Keypair.generate();
  localStorage.setItem(LS_KEY, JSON.stringify(Array.from(kp.secretKey)));
  return kp;
}

export function clearDevKeypair(): void {
  localStorage.removeItem(LS_KEY);
}
