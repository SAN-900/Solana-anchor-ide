import { SolanaWebIdeError } from '@solana-web-ide/shared';

/** Normalize a project-relative path. Strips leading ./ and collapses //. */
export function normalizePath(input: string): string {
    const trimmed = input.replace(/^\.\/+/, '').replace(/\/+/g, '/');
    if (trimmed.startsWith('/')) {
        throw new SolanaWebIdeError('Absolute paths are not allowed in VFS', {
            code: 'INVALID_INPUT',
            context: { path: input },
        });
    }
    if (trimmed.includes('..')) {
        throw new SolanaWebIdeError('Path traversal is not allowed in VFS', {
            code: 'INVALID_INPUT',
            context: { path: input },
        });
    }
    return trimmed;
}

export function parentDir(path: string): string {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? '' : path.slice(0, idx);
}

export function fileName(path: string): string {
    const idx = path.lastIndexOf('/');
    return idx === -1 ? path : path.slice(idx + 1);
}