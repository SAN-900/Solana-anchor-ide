import type { CSSProperties, ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  style?: CSSProperties;
}

/** Reusable side-panel shell: header + scrollable body. */
export function Panel({ title, children, actions, style }: PanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', ...style }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid #333', flexShrink: 0,
        background: '#252526',
      }}>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#888' }}>
          {title}
        </span>
        {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {children}
      </div>
    </div>
  );
}
