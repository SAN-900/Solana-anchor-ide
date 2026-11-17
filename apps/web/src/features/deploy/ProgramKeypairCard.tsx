import { listKeypairs, getOrCreateKeypair, deleteKeypair } from '@solana-web-ide/dev-keys';
import { useState, useEffect } from 'react';
import type { ProgramKeypair } from '@solana-web-ide/dev-keys';

export function ProgramKeypairCard() {
  const [keypairs, setKeypairs] = useState<ProgramKeypair[]>([]);

  useEffect(() => {
    setKeypairs(listKeypairs());
  }, []);

  const handleGenerate = () => {
    getOrCreateKeypair('counter');
    setKeypairs(listKeypairs());
  };

  const handleDelete = (name: string) => {
    deleteKeypair(name);
    setKeypairs(listKeypairs());
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Program Keypairs
      </div>
      {keypairs.length === 0 && (
        <p style={{ color: '#555', fontSize: 12 }}>No keypairs yet. Click Generate to create one.</p>
      )}
      {keypairs.map((kp) => (
        <div key={kp.name} style={{ background: '#2a2a2a', borderRadius: 4, padding: '8px 10px', marginBottom: 6, fontSize: 11 }}>
          <div style={{ color: '#ccc', fontWeight: 600 }}>{kp.name}</div>
          <div style={{ color: '#888', fontFamily: 'ui-monospace, monospace', marginTop: 2, wordBreak: 'break-all' }}>{kp.publicKey}</div>
          <button
            onClick={() => handleDelete(kp.name)}
            style={{ marginTop: 6, background: 'transparent', border: '1px solid #555', color: '#888', borderRadius: 3, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      ))}
      <button
        onClick={handleGenerate}
        style={{ background: '#3c3c3c', border: '1px solid #555', color: '#ccc', borderRadius: 3, padding: '5px 12px', fontSize: 12, cursor: 'pointer', marginTop: 4 }}
      >
        Generate Keypair
      </button>
    </div>
  );
}
