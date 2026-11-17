import { useAppStore } from '../../app/store';
import type { Cluster } from '@solana-web-ide/shared';

const CLUSTERS: Cluster[] = ['devnet', 'mainnet-beta', 'localnet'];

export function ClusterPicker() {
  const cluster = useAppStore((s) => s.cluster);
  const setCluster = useAppStore((s) => s.setCluster);
  return (
    <select
      value={cluster}
      onChange={(e) => setCluster(e.target.value as Cluster)}
      style={{ background: '#3c3c3c', color: '#ccc', border: '1px solid #555', borderRadius: 3, padding: '4px 8px', fontSize: 12 }}
    >
      {CLUSTERS.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}
