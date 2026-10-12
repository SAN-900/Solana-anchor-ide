export type Cluster = 'localnet' | 'devnet' | 'mainnet-beta';

export const CLUSTERS: readonly Cluster[] = ['localnet', 'devnet', 'mainnet-beta'] as const;

export function isCluster(value: unknown): value is Cluster {
    return typeof value === 'string' && (CLUSTERS as readonly string[]).includes(value);
}