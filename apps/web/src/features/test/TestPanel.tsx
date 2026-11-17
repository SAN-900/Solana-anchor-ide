export function TestPanel() {
  return (
    <div style={{ padding: 12, fontSize: 12, color: '#888' }}>
      <p style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, color: '#555', marginBottom: 12 }}>Test Runner</p>
      <p>Write Mocha-style tests in TypeScript. The runner executes them in a sandboxed Web Worker against devnet or localnet.</p>
      <p style={{ color: '#555', marginTop: 16 }}>Phase 4 — coming soon.</p>
    </div>
  );
}
