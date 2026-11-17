import { create } from 'zustand';

export interface VfsFileEntry {
  path: string;
  content: string;
  language: string;
}

interface EditorState {
  files: Record<string, VfsFileEntry>;
  activeFilePath: string | null;
  openPaths: string[];
  setFileContent: (path: string, content: string) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  addFile: (entry: VfsFileEntry) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  files: {},
  activeFilePath: null,
  openPaths: [],

  setFileContent: (path, content) =>
    set((s) => ({ files: { ...s.files, [path]: { ...s.files[path], content } } })),

  openFile: (path) =>
    set((s) => ({
      activeFilePath: path,
      openPaths: s.openPaths.includes(path) ? s.openPaths : [...s.openPaths, path],
    })),

  closeFile: (path) =>
    set((s) => {
      const openPaths = s.openPaths.filter((p) => p !== path);
      return {
        openPaths,
        activeFilePath: s.activeFilePath === path ? (openPaths.at(-1) ?? null) : s.activeFilePath,
      };
    }),

  addFile: (entry) =>
    set((s) => ({ files: { ...s.files, [entry.path]: entry } })),
}));
