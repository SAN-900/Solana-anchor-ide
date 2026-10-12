import type { Cluster } from '@solana-web-ide/shared';
import type { ProviderConfig, ClusterEndpoints } from './types.js';

const PUBLIC_RPC: Record<Cluster, string> = {
    localnet: 'http://127.0.0.1:8899',
    devnet: 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

export function publicProvider(cluster: Cluster): ProviderConfig {
    return {
        kind: 'public',
        label: `Public (${cluster})`,
        url: PUBLIC_RPC[cluster],
        requiresApiKey: false,
    };
}

export function heliusProvider(cluster: Cluster, apiKey: string): ProviderConfig {
    const subdomain = cluster === 'mainnet-beta' ? 'mainnet' : cluster;
    return {
        kind: 'helius',
        label: `Helius (${cluster})`,
        url: `https://${subdomain}.helius-rpc.com/?api-key=${encodeURIComponent(apiKey)}`,
        wsUrl: `wss://${subdomain}.helius-rpc.com/?api-key=${encodeURIComponent(apiKey)}`,
        requiresApiKey: true,
    };
}

export function tritonProvider(cluster: Cluster, apiKey: string): ProviderConfig {
    // Triton's endpoint format varies by plan. This is the standard shape.
    const subdomain = cluster === 'mainnet-beta' ? 'mainnet' : cluster;
    return {
        kind: 'triton',
        label: `Triton (${cluster})`,
        url: `https://${subdomain}.rpcpool.com/${encodeURIComponent(apiKey)}`,
        requiresApiKey: true,
    };
}

export function customProvider(label: string, url: string): ProviderConfig {
    return {
        kind: 'custom',
        label,
        url,
        requiresApiKey: false,
    };
}

/**
 * The default provider list for a cluster. Used by the settings UI to
 * pre-populate options.
 */
export function defaultEndpoints(cluster: Cluster): ClusterEndpoints {
    return {
        cluster,
        providers: [publicProvider(cluster)],
    };
}

export function clusterFromProvider(p: ProviderConfig): Cluster | undefined {
    const m = p.label.match(/\((localnet|devnet|mainnet-beta)\)/);
    if (!m) return undefined;
    return m[1] as Cluster;
}