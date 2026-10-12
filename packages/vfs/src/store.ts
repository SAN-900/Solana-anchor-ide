import { SolanaWebIdeError } from '@solana-web-ide/shared';
import { normalizePath } from './path.js';
import type { VfsFile, VfsListener, VfsSnapshot } from './types.js';

const DB_NAME = 'solana-web-ide';
const DB_VERSION = 1;
const STORE = 'projects';

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: 'projectId' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function readSnapshot(projectId: string): Promise<VfsSnapshot | undefined> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(projectId);
        req.onsuccess = () => resolve(req.result as VfsSnapshot | undefined);
        req.onerror = () => reject(req.error);
    });
}

async function writeSnapshot(snapshot: VfsSnapshot): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(snapshot);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export class VfsStore {
    private readonly projectId: string;
    private files = new Map<string, VfsFile>();
    private listeners = new Set<VfsListener>();
    private loaded = false;

    constructor(projectId: string) {
        this.projectId = projectId;
    }

    async load(): Promise<void> {
        if (this.loaded) return;
        const snap = await readSnapshot(this.projectId);
        if (snap) {
            for (const f of snap.files) this.files.set(f.path, f);
        }
        this.loaded = true;
    }

    async persist(): Promise<void> {
        await writeSnapshot({
            projectId: this.projectId,
            files: Array.from(this.files.values()),
            takenAt: Date.now(),
        });
    }

    list(): VfsFile[] {
        return Array.from(this.files.values()).sort((a, b) => a.path.localeCompare(b.path));
    }

    read(path: string): string | undefined {
        return this.files.get(normalizePath(path))?.content;
    }

    exists(path: string): boolean {
        return this.files.has(normalizePath(path));
    }

    async write(path: string, content: string): Promise<void> {
        const p = normalizePath(path);
        const existing = this.files.get(p);
        const file: VfsFile = { path: p, content, updatedAt: Date.now() };
        this.files.set(p, file);
        this.emit({ type: existing ? 'update' : 'create', path: p });
        await this.persist();
    }

    async delete(path: string): Promise<void> {
        const p = normalizePath(path);
        if (!this.files.has(p)) {
            throw new SolanaWebIdeError(`File not found: ${p}`, {
                code: 'VFS_NOT_FOUND',
                context: { path: p, projectId: this.projectId },
            });
        }
        this.files.delete(p);
        this.emit({ type: 'delete', path: p });
        await this.persist();
    }

    async clear(): Promise<void> {
        const paths = Array.from(this.files.keys());
        this.files.clear();
        for (const p of paths) this.emit({ type: 'delete', path: p });
        await this.persist();
    }

    subscribe(listener: VfsListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private emit(event: { type: 'create' | 'update' | 'delete'; path: string }): void {
        for (const l of this.listeners) l(event);
    }
}