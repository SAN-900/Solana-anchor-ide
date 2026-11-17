import Editor from '@monaco-editor/react';
import { useEditorStore } from './use-editor-store';

export function IdeEditor() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const files = useEditorStore((s) => s.files);
  const setFileContent = useEditorStore((s) => s.setFileContent);

  const activeFile = activeFilePath ? files[activeFilePath] : null;

  if (!activeFile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#555', fontSize: 13 }}>
        No file open — select a file from the sidebar
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={activeFile.language}
      theme="vs-dark"
      value={activeFile.content}
      onChange={(v) => setFileContent(activeFile.path, v ?? '')}
      options={{
        fontSize: 13,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        bracketPairColorization: { enabled: true },
        renderWhitespace: 'boundary',
      }}
    />
  );
}
