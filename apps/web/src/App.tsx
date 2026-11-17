import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { CompileResult } from '@solana-web-ide/compiler-core';
import { compileRemote } from './app/buildApi';
import { COUNTER_FIXTURE } from './app/fixtures';
import { loadKeypair, generateKeypair } from './app/programKeypair';

type Status = 'idle' | 'compiling' | 'compiled' | 'deploying' | 'deployed' | 'failed';

export function App() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [source, setSource] = useState(COUNTER_FIXTURE.files['programs/counter/src/lib.rs'] ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CompileResult | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  const compile = useCallback(async () => {
    setStatus('compiling');
    setResult(null);
    setProgramId(null);
    setDeployError(null);
    const files = { ...COUNTER_FIXTURE.files };
    files['programs/counter/src/lib.rs'] = source;
    const res = await compileRemote({
      runId: crypto.randomUUID(),
      manifestPath: COUNTER_FIXTURE.manifestPath,
      cluster: 'devnet',
      files,
    });
    setResult(res);
    setStatus(res.ok ? 'compiled' : 'failed');
  }, [source]);

  const deploy = useCallback(async () => {
    if (!result?.ok || !result.programSoBase64) return;
    if (!wallet.publicKey) {
      setDeployError('Connect a wallet first');
      return;
    }
    setStatus('deploying');
    setDeployError(null);
    try {
      let kp = loadKeypair('counter');
      if (!kp) kp = generateKeypair('counter');
      // Deploy implementation lands in Step 11. For now, show the program ID
      // that would be used, so the keypair flow is exercised end-to-end.
      setProgramId(kp.publicKey.toBase58());
      setStatus('deployed');
    } catch (err) {
      setDeployError(err instanceof Error ? err.message : String(err));
      setStatus('failed');
    }
  }, [result, wallet]);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <strong>Solana Web IDE</strong>
        <span style={styles.spacer} />
        <WalletMultiButton />
        <button
          style={styles.button}
          disabled={status === 'compiling'}
          onClick={compile}
        >
          {status === 'compiling' ? 'Compiling…' : 'Compile'}
        </button>
        <button
          style={{ ...styles.button, background: '#16825d' }}
          disabled={status !== 'compiled' || !wallet.publicKey}
          onClick={deploy}
        >
          {status === 'deploying' ? 'Deploying…' : 'Deploy to Devnet'}
        </button>
      </header>
      <div style={styles.body}>
        <section style={styles.editorPane}>
          <Editor
            height="100%"
            defaultLanguage="rust"
            theme="vs-dark"
            value={source}
            onChange={(v) => setSource(v ?? '')}
            options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
          />
        </section>
        <section style={styles.outputPane}>
          <div style={styles.outputHeader}>
            Output
            {result && <span style={styles.duration}>{result.durationMs.toFixed(0)} ms</span>}
          </div>
          <div style={styles.outputBody}>
            {!wallet.publicKey && <p style={styles.muted}>Connect a wallet to enable deploy.</p>}
            {result?.ok === true && (
              <div>
                <p style={styles.success}>Compile succeeded</p>
                <p style={styles.muted}>.so size: {Math.round((result.programSoBase64?.length ?? 0) * 0.75)} bytes</p>
              </div>
            )}
            {programId && (
              <div>
                <p style={styles.success}>Program ID: {programId}</p>
                <a
                  href={`https://explorer.solana.com/address/${programId}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#4ea1ff', fontSize: 12 }}
                >
                  View on Explorer
                </a>
              </div>
            )}
            {deployError && <p style={{ color: '#f14c4c' }}>{deployError}</p>}
            {result?.ok === false && result.diagnostics.map((d, i) => (
              <div key={i} style={styles.diagnostic}>
                <pre style={styles.diagnosticMessage}>{d.message}</pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#1e1e1e', color: '#ddd' },
  header: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#252526', borderBottom: '1px solid #333' },
  spacer: { flex: 1 },
  button: { background: '#0e639c', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  editorPane: { flex: 2, minWidth: 0, borderRight: '1px solid #333' },
  outputPane: { flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', background: '#1a1a1a' },
  outputHeader: { padding: '8px 12px', borderBottom: '1px solid #333', fontSize: 12, textTransform: 'uppercase', color: '#999', display: 'flex', justifyContent: 'space-between' },
  duration: { textTransform: 'none', color: '#666' },
  outputBody: { flex: 1, overflow: 'auto', padding: 12, fontSize: 12, lineHeight: 1.5 },
  muted: { color: '#888', margin: '4px 0' },
  success: { color: '#4ec9b0', fontWeight: 600, margin: '4px 0' },
  diagnostic: { marginBottom: 12, padding: 8, background: '#2a1e1e', borderLeft: '3px solid #f14c4c', borderRadius: 2 },
  diagnosticMessage: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ddd', fontFamily: 'ui-monospace, monospace', fontSize: 11 },
};