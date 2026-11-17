import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

/** Simple toast hook — returns showToast + the Toast renderer component. */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return { toasts, showToast };
}

const TYPE_COLOR = { success: '#4ec9b0', error: '#f14c4c', info: '#4ea1ff' };

export function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div style={{ position: 'fixed', bottom: 32, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: '#2d2d2d',
          border: `1px solid ${TYPE_COLOR[t.type]}`,
          borderRadius: 4,
          padding: '8px 14px',
          fontSize: 12,
          color: '#ccc',
          maxWidth: 320,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          <span style={{ color: TYPE_COLOR[t.type], marginRight: 8 }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
