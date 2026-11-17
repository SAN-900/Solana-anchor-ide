import { useEditorStore } from './use-editor-store';

export function FileTree() {
  const files = useEditorStore((s) => s.files);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFile = useEditorStore((s) => s.openFile);

  const paths = Object.keys(files).sort();

  return (
    <div style={{ padding: '8px 0', fontSize: 12, fontFamily: 'system-ui, sans-serif' }}>
      {paths.map((path) => (
        <div
          key={path}
          onClick={() => openFile(path)}
          style={{
            padding: '3px 12px',
            cursor: 'pointer',
            background: path === activeFilePath ? '#094771' : 'transparent',
            color: path === activeFilePath ? '#fff' : '#ccc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={path}
        >
          {path.split('/').pop()}
        </div>
      ))}
    </div>
  );
}
