import { SolanaWebIdeError } from '@solana-web-ide/shared';
import type { ProviderKind } from './types.js';

const STORAGE_PREFIX = 'swi:rpc-key:';

function keyFor(kind: ProviderKind): string {
    return `${STORAGE_PREFIX}${kind}`;
}

export function getApiKey(kind: ProviderKind): string | undefined {
    if (typeof sessionStorage === 'undefined') return undefined;
    return sessionStorage.getItem(keyFor(kind)) ?? undefined;
}

export function setApiKey(kind: ProviderKind, key: string): void {
    if (typeof sessionStorage === 'undefined') {
        throw new SolanaWebIdeError('sessionStorage unavailable', {
            code: 'INTERNAL',
            context: { kind },
        });
    }
    if (!key || key.trim().length === 0) {
        throw new SolanaWebIdeError('API key must be non-empty', {
            code: 'INVALID_INPUT',
            context: { kind },
        });
    }
    sessionStorage.setItem(keyFor(kind), key.trim());
}

export function clearApiKey(kind: ProviderKind): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(keyFor(kind));
}

export function hasApiKey(kind: ProviderKind): boolean {
    return getApiKey(kind) !== undefined;
}