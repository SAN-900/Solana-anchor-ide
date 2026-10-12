import { describe, it, expect } from 'vitest';
import { compileFailed, compileTimeout } from '../src/index.js';
import type { Diagnostic } from '@solana-web-ide/shared';

describe('compiler error constructors', () => {
    it('compileFailed includes diagnostic count', () => {
        const diagnostics: Diagnostic[] = [
            { severity: 'error', message: 'boom', file: 'lib.rs' },
        ];
        const err = compileFailed(diagnostics);
        expect(err.code).toBe('COMPILE_FAILED');
        expect(err.context.diagnosticCount).toBe(1);
        expect(err.context.firstMessage).toBe('boom');
    });

    it('compileTimeout includes runId and timeout', () => {
        const err = compileTimeout('run-42', 5000);
        expect(err.code).toBe('COMPILE_TIMEOUT');
        expect(err.context.runId).toBe('run-42');
        expect(err.context.timeoutMs).toBe(5000);
    });
});