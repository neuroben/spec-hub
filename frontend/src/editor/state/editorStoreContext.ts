import { createContext, use } from 'react';
import { useStore } from 'zustand';
import type { EditorStore, EditorStoreState } from './editorStore';

/**
 * Holds the store *instance*. The value never changes for the lifetime of a
 * provider, so the context itself never triggers re-renders — components
 * re-render only when their selected slice changes.
 */
export const EditorStoreContext = createContext<EditorStore | null>(null);

/** The store instance, e.g. for getState() in event handlers. */
export function useEditorStoreApi(): EditorStore {
  const store = use(EditorStoreContext);
  if (!store) throw new Error('useEditorStore must be used inside <EditorStoreProvider>');
  return store;
}

/** Subscribe to a slice. Selectors returning new arrays/objects need useShallow (or a memoized selector). */
export function useEditorStore<T>(selector: (state: EditorStoreState) => T): T {
  return useStore(useEditorStoreApi(), selector);
}
