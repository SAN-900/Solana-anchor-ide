import { createHash } from 'node:crypto';
import type { BuildResponse } from './types.js';

const MAX_ENTRIES = 50;

export function hashRequest(files: Record<string, string>, manifestPath: string): string {
    const h = createHash('sha256');
    h.update('manifest:' + manifestPath + '\n');
    const sorted = Object.keys(files).sort();
    for (const path of sorted) {
        h.update('file:' + path + '\n');
        h.update(files[path] ?? '');
        h.update('\n');
    }
    return h.digest('hex');
}

export class BuildCache {
    private store = new Map<string, BuildResponse>();

    get(key: string): BuildResponse | undefined {
        const hit = this.store.get(key);
        if (!hit) return undefined;
        // Refresh LRU position.
        this.store.delete(key);
        this.store.set(key, hit);
        return hit;
    }

    set(key: string, value: BuildResponse): void {
        if (this.store.has(key)) this.store.delete(key);
        this.store.set(key, value);
        while (this.store.size > MAX_ENTRIES) {
            const oldest = this.store.keys().next().value;
            if (oldest === undefined) break;
            this.store.delete(oldest);
        }
    }

    size(): number {
        return this.store.size;
    }
}