import { describe, it, expect } from 'vitest';
import { redactUrl } from '../src/index.js';

describe('redactUrl', () => {
    it('redacts api-key query params', () => {
        const out = redactUrl('https://devnet.helius-rpc.com/?api-key=sekret');
        expect(out).not.toContain('sekret');
        expect(out).toContain('api-key=***');
    });

    it('leaves non-sensitive params intact', () => {
        const out = redactUrl('https://example.com/?cluster=devnet');
        expect(out).toContain('cluster=devnet');
    });

    it('handles invalid URLs gracefully', () => {
        expect(redactUrl('not a url')).toBe('<invalid-url>');
    });
});