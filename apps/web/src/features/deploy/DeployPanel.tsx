import { useDeployStore } from './deploy-store';
import { ClusterPicker } from './ClusterPicker';

export function DeployPanel() {
  const { status, programId, signature, progress, error } = useDeployStore();

  return (
    <div style={{ padding: 12, fontSize: 12, color: '#ccc', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: '#888', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Deploy</span>
        <ClusterPicker />
      </div>

      {status === 'idle' && <p style={{ color: '#555' }}>Compile successfully, then click Deploy.</p>}
      {status === 'deploying' && progress && (
        <div>
          <p style={{ color: '#cca700' }}>{progress.message}</p>
          <div style={{ background: '#333', borderRadius: 2, height: 4, marginTop: 8 }}>
            <div style={{ background: '#0e639c', height: '100%', width: `${progress.pct}%`, borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}
      {status === 'success' && programId && (
        <div>
          <p style={{ color: '#4ec9b0', fontWeight: 600 }}>Deployed successfully</p>
          <p style={{ color: '#888' }}>Program ID: <code style={{ color: '#ce9178' }}>{programId}</code></p>
          {signature && <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noreferrer" style={{ color: '#4ea1ff' }}>View on Explorer</a>}
        </div>
      )}
      {status === 'error' && error && <p style={{ color: '#f14c4c' }}>{error}</p>}
    </div>
  );
}
