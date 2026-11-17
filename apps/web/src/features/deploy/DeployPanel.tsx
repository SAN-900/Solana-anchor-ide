import { useDeployStore } from './deploy-store';
import { useBuildStore } from '../build/build-store';
import { ClusterPicker } from './ClusterPicker';
import { ProgramKeypairCard } from './ProgramKeypairCard';
import { useDeploy } from './use-deploy';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '../../components/Button';

export function DeployPanel() {
  const { status, programId, signature, progress, error } = useDeployStore();
  const buildResult = useBuildStore((s) => s.result);
  const { deploy } = useDeploy();
  const wallet = useWallet();

  const canDeploy = Boolean(buildResult?.ok && wallet.publicKey && status !== 'deploying');

  return (
    <div style={{ padding: 12, fontSize: 12, color: '#ccc', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: '#888', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Deploy</span>
        <ClusterPicker />
      </div>

      <Button
        variant="primary"
        disabled={!canDeploy}
        onClick={deploy}
        style={{ width: '100%', marginBottom: 12, background: canDeploy ? '#16825d' : undefined }}
      >
        {status === 'deploying' ? 'Deploying...' : 'Deploy to Cluster'}
      </Button>

      {!wallet.publicKey && (
        <p style={{ color: '#cca700', margin: '4px 0 12px 0' }}>Connect your Solana wallet to enable deploy.</p>
      )}

      {!buildResult?.ok && wallet.publicKey && (
        <p style={{ color: '#888', margin: '4px 0 12px 0' }}>Compile program successfully before deploying.</p>
      )}

      {status === 'deploying' && progress && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ color: '#cca700' }}>{progress.message}</p>
          <div style={{ background: '#333', borderRadius: 2, height: 4, marginTop: 8 }}>
            <div style={{ background: '#0e639c', height: '100%', width: `${progress.pct}%`, borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {status === 'success' && programId && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ color: '#4ec9b0', fontWeight: 600 }}>Deployed successfully</p>
          <p style={{ color: '#888' }}>Program ID: <code style={{ color: '#ce9178' }}>{programId}</code></p>
          {signature && (
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#4ea1ff' }}
            >
              View on Explorer
            </a>
          )}
        </div>
      )}

      {status === 'error' && error && (
        <p style={{ color: '#f14c4c', marginBottom: 12 }}>{error}</p>
      )}

      <hr style={{ borderColor: '#333', margin: '14px 0' }} />
      <ProgramKeypairCard />
    </div>
  );
}
