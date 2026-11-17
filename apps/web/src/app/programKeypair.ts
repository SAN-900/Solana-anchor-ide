import { Keypair } from '@solana/web3.js';

const STORAGE_PREFIX = 'swi:program-keypair:';

export interface StoredKeypair {
    publicKey: string;
    secretKeyBase64: string;
}

export function loadKeypair(programName: string): Keypair | null {
    const raw = localStorage.getItem(STORAGE_PREFIX + programName);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as StoredKeypair;
        const secret = Uint8Array.from(atob(parsed.secretKeyBase64), (c) => c.charCodeAt(0));
        return Keypair.fromSecretKey(secret);
    } catch {
        return null;
    }
}

export function generateKeypair(programName: string): Keypair {
    const kp = Keypair.generate();
    persist(programName, kp);
    return kp;
}

export function persist(programName: string, kp: Keypair): void {
    const payload: StoredKeypair = {
        publicKey: kp.publicKey.toBase58(),
        secretKeyBase64: btoa(String.fromCharCode(...kp.secretKey)),
    };
    localStorage.setItem(STORAGE_PREFIX + programName, JSON.stringify(payload));
}

export function exportAsJson(programName: string): string | null {
    const raw = localStorage.getItem(STORAGE_PREFIX + programName);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredKeypair;
    const secret = Uint8Array.from(atob(parsed.secretKeyBase64), (c) => c.charCodeAt(0));
    return JSON.stringify(Array.from(secret));
}