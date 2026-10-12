import type { Cluster } from '../types/cluster.js';

/**
 * Public default RPC endpoints. Not for production traffic.
 * The IDE routes through apps/rpc-proxy for CORS and key protection.
 */
export const DEFAULT_RPC_ENDPOINTS: Record<Cluster, string> = {
    localnet: 'http://127.0.0.1:8899',
    devnet: 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

export const DEFAULT_CLUSTER: Cluster = 'devnet';