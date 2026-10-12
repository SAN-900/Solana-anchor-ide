import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { VfsStore, normalizePath, parentDir, fileName } from '../src/index.js';

describe('path helpers', () => {
    it('normalizes leading ./ and duplicate slashes', () => {
        expect(normalizePath('./programs/counter//src/lib.rs')).toBe('programs/counter/src/lib.rs');
    });

    it('rejects path traversal', () => {
        expect(() => normalizePath('../etc/passwd')).toThrow();
    });

    it('rejects absolute paths', () => {
        expect(() => normalizePath('/etc/passwd')).toThrow();
    });

    it('extracts parent and filename', () => {
        expect(parentDir('programs/counter/src/lib.rs')).toBe('programs/counter/src');
        expect(fileName('programs/counter/src/lib.rs')).toBe('lib.rs');
        expect(parentDir('lib.rs')).toBe('');
        expect(fileName('lib.rs')).toBe('lib.rs');
    });
});

describe('VfsStore', () => {
    let vfs: VfsStore;

    beforeEach(async () => {
        // unique project ID per test to avoid cross-test contamination
        vfs = new VfsStore(`test-${Date.now()}-${Math.random()}`);
        await vfs.load();
    });

    it('writes and reads a file', async () => {
        await vfs.write('programs/counter/src/lib.rs', 'pub fn hello() {}');
        expect(vfs.read('programs/counter/src/lib.rs')).toBe('pub fn hello() {}');
    });

    it('emits create then update events', async () => {
        const events: string[] = [];
        vfs.subscribe((e) => events.push(`${e.type}:${e.path}`));
        await vfs.write('a.rs', 'v1');
        await vfs.write('a.rs', 'v2');
        expect(events).toEqual(['create:a.rs', 'update:a.rs']);
    });

    it('throws on delete of missing file', async () => {
        await expect(vfs.delete('missing.rs')).rejects.toThrow();
    });

    it('lists files in sorted order', async () => {
        await vfs.write('b.rs', '');
        await vfs.write('a.rs', '');
        await vfs.write('c.rs', '');
        expect(vfs.list().map((f) => f.path)).toEqual(['a.rs', 'b.rs', 'c.rs']);
    });

    it('persists across instances', async () => {
        const id = `persist-${Date.now()}`;
        const first = new VfsStore(id);
        await first.load();
        await first.write('keep.rs', 'durable');

        const second = new VfsStore(id);
        await second.load();
        expect(second.read('keep.rs')).toBe('durable');
    });
});