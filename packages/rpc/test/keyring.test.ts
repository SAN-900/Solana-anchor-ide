import { describe, it, expect, beforeEach } from 'vitest';
import { getApiKey, setApiKey, clearApiKey, hasApiKey } from '../src/index.js';

// Minimal sessionStorage shim for Node
class MemoryStorage {
    private store = new Map<string, string>();
    getItem(k: string) { return this.store.get(k) ?? null; }
    setItem(k: string, v: string) { this.store.set(k, v); }
    removeItem(k: string) { this.store.delete(k); }
    clear() { this.store.clear(); }
}

beforeEach(() => {
    (globalThis as unknown as { sessionStorage: MemoryStorage }).sessionStorage =
        new MemoryStorage();
});

describe('keyring', () => {
    it('stores and retrieves a key', () => {
        setApiKey('helius', 'secret');
        expect(getApiKey('helius')).toBe('secret');
        expect(hasApiKey('helius')).toBe(true);
    });

    it('trims whitespace', () => {
        setApiKey('helius', '  secret  ');
        expect(getApiKey('helius')).toBe('secret');
    });

    it('rejects empty keys', () => {
        expect(() => setApiKey('helius', '   ')).toThrow();
    });

    it('isolates providers from each other', () => {
        setApiKey('helius', 'h');
        setApiKey('triton', 't');
        expect(getApiKey('helius')).toBe('h');
        expect(getApiKey('triton')).toBe('t');
        clearApiKey('helius');
        expect(hasApiKey('helius')).toBe(false);
        expect(hasApiKey('triton')).toBe(true);
    });
});