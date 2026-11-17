import { useEditorStore } from './use-editor-store';
import { COUNTER_FIXTURE } from '../../app/fixtures';

export function FileTree() {
  const files = useEditorStore((s) => s.files);
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFile = useEditorStore((s) => s.openFile);
  const addFile = useEditorStore((s) => s.addFile);

  const paths = Object.keys(files).sort();

  const loadCounterTemplate = () => {
    for (const [path, content] of Object.entries(COUNTER_FIXTURE.files)) {
      const ext = path.split('.').pop();
      const language = ext === 'rs' ? 'rust' : ext === 'toml' ? 'toml' : ext === 'ts' ? 'typescript' : 'plaintext';
      addFile({ path, content, language });
    }
    openFile('programs/counter/src/lib.rs');
  };

  return (
    <div style={{ padding: '8px 0', fontSize: 12, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 8px 12px', borderBottom: '1px solid #333' }}>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#888' }}>
          Explorer
        </span>
        <button
          onClick={loadCounterTemplate}
          style={{
            background: 'transparent',
            border: '1px solid #555',
            color: '#4ea1ff',
            fontSize: 10,
            borderRadius: 3,
            padding: '2px 6px',
            cursor: 'pointer',
          }}
          title="Reset to Counter Template"
        >
          Reset Template
        </button>
      </div>

      {paths.length === 0 ? (
        <div style={{ padding: 12, color: '#666', textAlign: 'center' }}>
          <p>No files loaded.</p>
          <button
            onClick={loadCounterTemplate}
            style={{
              background: '#0e639c',
              border: 'none',
              color: '#fff',
              fontSize: 12,
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Load Counter Template
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>
          {paths.map((path) => (
            <div
              key={path}
              onClick={() => openFile(path)}
              style={{
                padding: '4px 12px',
                cursor: 'pointer',
                background: path === activeFilePath ? '#094771' : 'transparent',
                color: path === activeFilePath ? '#fff' : '#ccc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
              }}
              title={path}
            >
              {path}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
