import { useEffect, useState, type ReactNode } from 'react';
import type { Document } from '../../api/documentTypes';
import { createEditorStore, type EditorStore } from './editorStore';
import { EditorStoreContext } from './editorStoreContext';

interface EditorStoreProviderProps {
  children: ReactNode;
  /** Loaded once, when the provider mounts. */
  initialDocument?: Document;
}

declare global {
  interface Window {
    /** DEV only: the most recently mounted editor store. */
    __editorStore?: EditorStore;
  }
}

/** One independent store per mount (e.g. per editor route visit). */
export function EditorStoreProvider({ children, initialDocument }: EditorStoreProviderProps) {
  const [store] = useState(() => createEditorStore({ initialDocument }));

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__editorStore = store;
    return () => {
      if (window.__editorStore === store) delete window.__editorStore;
    };
  }, [store]);

  return <EditorStoreContext value={store}>{children}</EditorStoreContext>;
}
