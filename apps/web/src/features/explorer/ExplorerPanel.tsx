export function ExplorerPanel() {
  return (
    <div style={{ padding: 12, fontSize: 12, color: '#888' }}>
      <p style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, color: '#555', marginBottom: 12 }}>Account Explorer</p>
      <p>Enter a public key to inspect an on-chain account.</p>
      <input
        placeholder="Public key (base58)..."
        style={{ width: '100%', boxSizing: 'border-box', background: '#3c3c3c', border: '1px solid #555', color: '#ccc', borderRadius: 3, padding: '6px 8px', fontSize: 12 }}
      />
      <p style={{ color: '#555', marginTop: 16 }}>Phase 5 — coming soon.</p>
    </div>
  );
}
