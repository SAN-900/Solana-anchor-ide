import type { Cluster } from '@solana-web-ide/shared';

export type ProviderKind = 'public' | 'helius' | 'triton' | 'custom';

export interface ProviderConfig {
    kind: ProviderKind;
    /** Human label shown in the UI, e.g. "Helius (devnet)" */
    label: string;
    /** Full RPC URL, including any api-key query param */
    url: string;
    /** WebSocket URL, if the provider supports subscriptions */
    wsUrl?: string;
    /**
     * Whether this provider requires an API key. When true, the UI must
     * collect one before this config is usable.
     */
    requiresApiKey: boolean;
}

export interface ClusterEndpoints {
    cluster: Cluster;
    providers: ProviderConfig[];
}

/**
 * The public surface. Wraps web3.js Connection so callers never import
 * web3.js directly — this keeps the dependency swappable.
 */
export interface RpcClient {
    readonly cluster: Cluster;
    readonly provider: ProviderConfig;
    readonly url: string;

    /** Raw JSON-RPC call. Throws SolanaWebIdeError on transport failure. */
    call<T = unknown>(method: string, params: unknown[]): Promise<T>;

    /** web3.js Connection for use with Anchor, wallet adapter, etc. */
    connection(): import('@solana/web3.js').Connection;
}