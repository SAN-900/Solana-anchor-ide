import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { CompileResult } from '@solana-web-ide/compiler-core';
import { compileRemote } from './app/buildApi';
import { COUNTER_FIXTURE } from './app/fixtures';

type Status = 'idle' | 'compiling' | 'ok' | 'failed';

export function App() {
  const [source, setSource] = useState(COUNTER_FIXTURE.files['programs/counter/src/lib.rs'] ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CompileResult | null>(null);

  const compile = useCallback(async () => {
    setStatus('compiling');
    setResult(null);
    const files = { ...COUNTER_FIXTURE.files };
    files['programs/counter/src/lib.rs'] = source;
    const res = await compileRemote({
      runId: crypto.randomUUID(),
      manifestPath: COUNTER_FIXTURE.manifestPath,
      cluster: 'devnet',
      files,
    });
    setResult(res);
    setStatus(res.ok ? 'ok' : 'failed');
  }, [source]);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <strong>Solana Web IDE</strong>
        <span style={styles.spacer} />
        <button
          style={styles.button}
          disabled={status === 'compiling'}
          onClick={compile}
        >
          {status === 'compiling' ? 'Compiling…' : 'Compile'}
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
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </section>
        <section style={styles.outputPane}>
          <div style={styles.outputHeader}>
            Output
            {result && (
              <span style={styles.duration}>
                {result.durationMs.toFixed(0)} ms · {result.backend}
              </span>
            )}
          </div>
          <div style={styles.outputBody}>
            {status === 'idle' && <p style={styles.muted}>Click Compile to build the counter program.</p>}
            {status === 'compiling' && <p style={styles.muted}>Running anchor build in remote sandbox…</p>}
            {result?.ok === true && (
              <div>
                <p style={styles.success}>Compile succeeded</p>
                <p style={styles.muted}>
                  .so size: {Math.round((result.programSoBase64?.length ?? 0) * 0.75)} bytes
                </p>
                {result.idl !== null && result.idl !== undefined && (
                  <p style={styles.muted}>IDL generated ✓</p>
                )}
              </div>
            )}
            {result?.ok === false && (
              <div>
                {result.diagnostics.map((d, i) => (
                  <div key={i} style={styles.diagnostic}>
                    <div style={styles.diagnosticHeader}>
                      <span style={d.severity === 'error' ? styles.errorBadge : styles.warnBadge}>
                        {d.severity}
                      </span>
                      <span style={styles.diagnosticFile}>
                        {d.file}{d.span ? `:${d.span.line}:${d.span.column}` : ''}
                      </span>
                    </div>
                    <pre style={styles.diagnosticMessage}>{d.message}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#1e1e1e', color: '#ddd' },
  header: { display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#252526', borderBottom: '1px solid #333' },
  spacer: { flex: 1 },
  button: { background: '#0e639c', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  editorPane: { flex: 2, minWidth: 0, borderRight: '1px solid #333' },
  outputPane: { flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', background: '#1a1a1a' },
  outputHeader: { padding: '8px 12px', borderBottom: '1px solid #333', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#999', display: 'flex', justifyContent: 'space-between' },
  duration: { textTransform: 'none', color: '#666' },
  outputBody: { flex: 1, overflow: 'auto', padding: 12, fontSize: 12, lineHeight: 1.5 },
  muted: { color: '#888', margin: '4px 0' },
  success: { color: '#4ec9b0', fontWeight: 600, margin: '4px 0' },
  diagnostic: { marginBottom: 12, padding: 8, background: '#2a1e1e', borderLeft: '3px solid #f14c4c', borderRadius: 2 },
  diagnosticHeader: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 },
  diagnosticFile: { color: '#888', fontSize: 11 },
  diagnosticMessage: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#ddd', fontFamily: 'ui-monospace, monospace', fontSize: 11 },
  errorBadge: { background: '#f14c4c', color: '#fff', padding: '1px 6px', borderRadius: 2, fontSize: 10, textTransform: 'uppercase' },
  warnBadge: { background: '#cca700', color: '#000', padding: '1px 6px', borderRadius: 2, fontSize: 10, textTransform: 'uppercase' },
};