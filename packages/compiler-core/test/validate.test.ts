import { describe, it, expect } from 'vitest';
import { validateCompileRequest } from '../src/index.js';
import type { CompileRequest } from '../src/index.js';

function makeRequest(overrides: Partial<CompileRequest> = {}): CompileRequest {
    return {
        runId: 'run-1',
        manifestPath: 'Anchor.toml',
        files: { 'Anchor.toml': '[programs.localnet]\ncounter = "Counter1111"' },
        cluster: 'devnet',
        ...overrides,
    };
}

describe('validateCompileRequest', () => {
    it('accepts a well-formed request', () => {
        expect(() => validateCompileRequest(makeRequest())).not.toThrow();
    });

    it('rejects missing runId', () => {
        expect(() => validateCompileRequest(makeRequest({ runId: '' }))).toThrow(/runId/);
    });

    it('rejects traversal in manifestPath', () => {
        expect(() => validateCompileRequest(makeRequest({ manifestPath: '../Anchor.toml' }))).toThrow(
            /project-relative/,
        );
    });

    it('rejects absolute manifestPath', () => {
        expect(() => validateCompileRequest(makeRequest({ manifestPath: '/Anchor.toml' }))).toThrow(
            /project-relative/,
        );
    });

    it('rejects empty files map', () => {
        expect(() => validateCompileRequest(makeRequest({ files: {} }))).toThrow(/at least one/);
    });

    it('rejects when manifest is not present in files', () => {
        expect(() =>
            validateCompileRequest(makeRequest({ files: { 'other.toml': '' } })),
        ).toThrow(/not found in files/);
    });
});