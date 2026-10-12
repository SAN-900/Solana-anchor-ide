import { Connection } from '@solana/web3.js';
import { SolanaWebIdeError } from '@solana-web-ide/shared';
import type { Cluster } from '@solana-web-ide/shared';
import type { ProviderConfig, RpcClient } from './types.js';

interface JsonRpcResponse<T> {
    jsonrpc: '2.0';
    id: number | string;
    result?: T;
    error?: { code: number; message: string; data?: unknown };
}

export class Web3RpcClient implements RpcClient {
    readonly cluster: Cluster;
    readonly provider: ProviderConfig;
    readonly url: string;
    private conn: Connection | null = null;
    private nextId = 1;

    constructor(cluster: Cluster, provider: ProviderConfig) {
        this.cluster = cluster;
        this.provider = provider;
        this.url = provider.url;
    }

    connection(): Connection {
        if (!this.conn) {
            this.conn = new Connection(this.url, 'confirmed');
        }
        return this.conn;
    }

    async call<T = unknown>(method: string, params: unknown[]): Promise<T> {
        const id = this.nextId++;
        const body = JSON.stringify({ jsonrpc: '2.0', id, method, params });

        let res: Response;
        try {
            res = await fetch(this.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            });
        } catch (cause) {
            throw new SolanaWebIdeError(`RPC transport failed: ${method}`, {
                code: 'RPC_UNAVAILABLE',
                cause,
                context: { method, url: redactUrl(this.url) },
            });
        }

        if (!res.ok) {
            throw new SolanaWebIdeError(`RPC HTTP ${res.status}: ${method}`, {
                code: 'RPC_UNAVAILABLE',
                context: { method, status: res.status, url: redactUrl(this.url) },
            });
        }

        let json: JsonRpcResponse<T>;
        try {
            json = (await res.json()) as JsonRpcResponse<T>;
        } catch (cause) {
            throw new SolanaWebIdeError(`RPC returned non-JSON: ${method}`, {
                code: 'RPC_INVALID_RESPONSE',
                cause,
                context: { method },
            });
        }

        if (json.error) {
            throw new SolanaWebIdeError(`RPC error: ${json.error.message}`, {
                code: 'RPC_INVALID_RESPONSE',
                context: { method, rpcCode: json.error.code },
            });
        }

        return json.result as T;
    }
}

/** Strip api-key query params for logging. */
export function redactUrl(url: string): string {
    try {
        const u = new URL(url);
        for (const key of Array.from(u.searchParams.keys())) {
            if (/key|token|secret/i.test(key)) u.searchParams.set(key, '***');
        }
        return u.toString();
    } catch {
        return '<invalid-url>';
    }
}