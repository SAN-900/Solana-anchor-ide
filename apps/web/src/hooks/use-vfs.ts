import { useCallback } from 'react';
import { useEditorStore } from '../features/editor/use-editor-store';

/** Convenience hook that wraps the VFS-backed editor store. */
export function useVfs() {
  const addFile = useEditorStore((s) => s.addFile);
  const files = useEditorStore((s) => s.files);

  const writeFile = useCallback((path: string, content: string) => {
    const ext = path.split('.').pop();
    const language = ext === 'rs' ? 'rust' : ext === 'toml' ? 'toml' : ext === 'ts' ? 'typescript' : 'plaintext';
    addFile({ path, content, language });
  }, [addFile]);

  return { files, writeFile };
}
