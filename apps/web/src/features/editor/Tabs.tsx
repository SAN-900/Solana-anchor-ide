import { useEditorStore } from './use-editor-store';

export function EditorTabs() {
  const openPaths = useEditorStore((s) => s.openPaths);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFile = useEditorStore((s) => s.openFile);
  const closeFile = useEditorStore((s) => s.closeFile);

  return (
    <div style={{ display: 'flex', overflowX: 'auto', background: '#252526', borderBottom: '1px solid #333', flexShrink: 0 }}>
      {openPaths.map((path) => {
        const isActive = path === activeFilePath;
        const name = path.split('/').pop() ?? path;
        return (
          <div
            key={path}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              borderRight: '1px solid #333',
              background: isActive ? '#1e1e1e' : '#2d2d2d',
              color: isActive ? '#fff' : '#888',
              fontSize: 12,
              flexShrink: 0,
              borderBottom: isActive ? '1px solid #1e1e1e' : 'none',
            }}
            onClick={() => openFile(path)}
          >
            <span>{name}</span>
            <span
              onClick={(e) => { e.stopPropagation(); closeFile(path); }}
              style={{ opacity: 0.5, lineHeight: 1, fontSize: 14, cursor: 'pointer' }}
              title="Close"
            >x</span>
          </div>
        );
      })}
    </div>
  );
}
