import { useAppStore } from '../../app/store';
import { useBuildStore } from '../../features/build/build-store';

export function StatusBar() {
  const cluster = useAppStore((s) => s.cluster);
  const buildStatus = useBuildStore((s) => s.status);

  const statusColor = buildStatus === 'success' ? '#4ec9b0' : buildStatus === 'error' ? '#f14c4c' : buildStatus === 'compiling' ? '#cca700' : '#888';

  return (
    <div style={{
      height: 22, background: '#007acc', display: 'flex', alignItems: 'center',
      padding: '0 12px', gap: 16, fontSize: 11, color: '#fff', flexShrink: 0,
    }}>
      <span>Solana Web IDE</span>
      <span style={{ opacity: 0.7 }}>|</span>
      <span>{cluster}</span>
      <span style={{ opacity: 0.7 }}>|</span>
      <span style={{ color: statusColor }}>
        {buildStatus === 'idle' ? 'Ready' : buildStatus === 'compiling' ? 'Compiling...' : buildStatus === 'success' ? 'Build OK' : 'Build Failed'}
      </span>
    </div>
  );
}
