import { describe, it, expect } from 'vitest';
import { BuildCache, hashRequest } from '../src/cache.js';

describe('hashRequest', () => {
    it('is stable across key ordering', () => {
        const a = hashRequest({ 'a.rs': 'x', 'b.rs': 'y' }, 'Anchor.toml');
        const b = hashRequest({ 'b.rs': 'y', 'a.rs': 'x' }, 'Anchor.toml');
        expect(a).toBe(b);
    });

    it('changes when content changes', () => {
        const a = hashRequest({ 'a.rs': 'x' }, 'Anchor.toml');
        const b = hashRequest({ 'a.rs': 'y' }, 'Anchor.toml');
        expect(a).not.toBe(b);
    });

    it('changes when manifest changes', () => {
        const a = hashRequest({ 'a.rs': 'x' }, 'Anchor.toml');
        const b = hashRequest({ 'a.rs': 'x' }, 'Cargo.toml');
        expect(a).not.toBe(b);
    });
});

describe('BuildCache', () => {
    it('evicts oldest past capacity', () => {
        const c = new BuildCache();
        const v = { ok: true, diagnostics: [], durationMs: 0 };
        for (let i = 0; i < 60; i++) c.set(`k${i}`, v);
        expect(c.size()).toBe(50);
        expect(c.get('k0')).toBeUndefined();
        expect(c.get('k59')).toBeDefined();
    });
});