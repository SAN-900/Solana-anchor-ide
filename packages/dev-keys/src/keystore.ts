import type { ProgramKeypair } from './types.js';
import { Keypair } from '@solana/web3.js';

const LS_PREFIX = 'solana-web-ide:program-key:';

/** Persist a program keypair to localStorage. */
export function saveKeypair(name: string, kp: Keypair): ProgramKeypair {
  const record: ProgramKeypair = {
    name,
    publicKey: kp.publicKey.toBase58(),
    secretKeyBase64: btoa(String.fromCharCode(...kp.secretKey)),
    createdAt: Date.now(),
  };
  localStorage.setItem(LS_PREFIX + name, JSON.stringify(record));
  return record;
}

/** Load a keypair by name. Returns null if not found. */
export function loadKeypair(name: string): Keypair | null {
  const raw = localStorage.getItem(LS_PREFIX + name);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as ProgramKeypair;
    const bytes = Uint8Array.from(atob(record.secretKeyBase64), (c) => c.charCodeAt(0));
    return Keypair.fromSecretKey(bytes);
  } catch {
    return null;
  }
}

/** Load or generate (and persist) a keypair for a program. */
export function getOrCreateKeypair(name: string): Keypair {
  const existing = loadKeypair(name);
  if (existing) return existing;
  const kp = Keypair.generate();
  saveKeypair(name, kp);
  return kp;
}

export function listKeypairs(): ProgramKeypair[] {
  const results: ProgramKeypair[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(LS_PREFIX)) {
      try { results.push(JSON.parse(localStorage.getItem(key)!)); } catch { /* skip */ }
    }
  }
  return results;
}

export function deleteKeypair(name: string): void {
  localStorage.removeItem(LS_PREFIX + name);
}
