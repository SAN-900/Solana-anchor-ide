import { describe, it, expect } from 'vitest';
import {
    publicProvider,
    heliusProvider,
    tritonProvider,
    customProvider,
    clusterFromProvider,
} from '../src/index.js';

describe('provider constructors', () => {
    it('builds a public devnet provider', () => {
        const p = publicProvider('devnet');
        expect(p.kind).toBe('public');
        expect(p.url).toBe('https://api.devnet.solana.com');
        expect(p.requiresApiKey).toBe(false);
    });

    it('builds a Helius devnet provider with the key in the URL', () => {
        const p = heliusProvider('devnet', 'abc 123');
        expect(p.kind).toBe('helius');
        expect(p.url).toContain('devnet.helius-rpc.com');
        expect(p.url).toContain('abc%20123');
        expect(p.wsUrl?.startsWith('wss://')).toBe(true);
        expect(p.requiresApiKey).toBe(true);
    });

    it('maps mainnet-beta to the Helius mainnet subdomain', () => {
        const p = heliusProvider('mainnet-beta', 'k');
        expect(p.url).toContain('mainnet.helius-rpc.com');
    });

    it('builds a Triton provider', () => {
        const p = tritonProvider('mainnet-beta', 'key1');
        expect(p.kind).toBe('triton');
        expect(p.url).toContain('mainnet.rpcpool.com');
    });

    it('passes through custom endpoints untouched', () => {
        const p = customProvider('My Node', 'http://10.0.0.1:8899');
        expect(p.kind).toBe('custom');
        expect(p.url).toBe('http://10.0.0.1:8899');
        expect(p.requiresApiKey).toBe(false);
    });

    it('recovers the cluster from the label', () => {
        expect(clusterFromProvider(publicProvider('devnet'))).toBe('devnet');
        expect(clusterFromProvider(customProvider('whatever', 'http://x'))).toBeUndefined();
    });
});