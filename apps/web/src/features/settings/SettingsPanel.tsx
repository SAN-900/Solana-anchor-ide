export function SettingsPanel() {
  return (
    <div style={{ padding: 12, fontSize: 12, color: '#ccc' }}>
      <p style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1, color: '#555', marginBottom: 16 }}>Settings</p>
      <label style={{ display: 'block', marginBottom: 8, color: '#888' }}>Helius API Key</label>
      <input
        type="password"
        placeholder="Enter your Helius API key..."
        style={{ width: '100%', boxSizing: 'border-box', background: '#3c3c3c', border: '1px solid #555', color: '#ccc', borderRadius: 3, padding: '6px 8px', fontSize: 12, marginBottom: 16 }}
      />
      <label style={{ display: 'block', marginBottom: 8, color: '#888' }}>Triton API Key</label>
      <input
        type="password"
        placeholder="Enter your Triton API key..."
        style={{ width: '100%', boxSizing: 'border-box', background: '#3c3c3c', border: '1px solid #555', color: '#ccc', borderRadius: 3, padding: '6px 8px', fontSize: 12 }}
      />
    </div>
  );
}
