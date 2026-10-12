import { describe, it, expect } from 'vitest';
import { SolanaWebIdeError, isCluster, DEFAULT_CLUSTER } from '../src/index.js';

describe('SolanaWebIdeError', () => {
    it('carries a code and structured context', () => {
        const err = new SolanaWebIdeError('compile blew up', {
            code: 'COMPILE_FAILED',
            context: { file: 'lib.rs', line: 12 },
        });
        expect(err.code).toBe('COMPILE_FAILED');
        expect(err.context).toEqual({ file: 'lib.rs', line: 12 });
        expect(err.message).toBe('compile blew up');
    });

    it('preserves the cause', () => {
        const cause = new Error('root cause');
        const err = new SolanaWebIdeError('wrapper', { code: 'INTERNAL', cause });
        expect(err.cause).toBe(cause);
    });

    it('serializes to JSON without losing the code', () => {
        const err = new SolanaWebIdeError('oops', { code: 'RPC_UNAVAILABLE' });
        const json = err.toJSON();
        expect(json.code).toBe('RPC_UNAVAILABLE');
        expect(json.name).toBe('SolanaWebIdeError');
    });
});

describe('cluster guards', () => {
    it('accepts known clusters', () => {
        expect(isCluster('devnet')).toBe(true);
        expect(isCluster('mainnet-beta')).toBe(true);
    });

    it('rejects unknowns', () => {
        expect(isCluster('testnet')).toBe(false);
        expect(isCluster(42)).toBe(false);
    });

    it('has a sensible default', () => {
        expect(DEFAULT_CLUSTER).toBe('devnet');
    });
});