import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import type { ComponentType, Document, Uuid } from '../../api/documentTypes';
import type { EditorAction } from './actions';
import { createInitialState, editorReducer } from './editorReducer';
import { createComponent, createModule } from './factories';
import { fromDocument, toDocument } from './serialize';
import type { ComponentKey, ComponentParamsPatch, EditorState, ModuleDraftPatch } from './types';

export interface EditorActions {
  dispatch: (action: EditorAction) => void;
  loadDocument: (document: Document) => void;
  /** Adds an empty module, selects it and returns its id. */
  addModule: (title?: string) => Uuid;
  removeModule: (moduleId: Uuid) => void;
  selectModule: (moduleId: Uuid | null) => void;
  updateModuleDraft: (moduleId: Uuid, patch: ModuleDraftPatch) => void;
  /** Save: draft → saved. */
  commitModule: (moduleId: Uuid) => void;
  /** Cancel: drops the draft. */
  revertModule: (moduleId: Uuid) => void;
  /** Adds a component with default params to the module's draft; returns its key (null if the module does not exist). */
  addComponent: (moduleId: Uuid, type: ComponentType) => ComponentKey | null;
  updateComponent: (moduleId: Uuid, key: ComponentKey, params: ComponentParamsPatch) => void;
  removeComponent: (moduleId: Uuid, key: ComponentKey) => void;
  /** Call after the document was saved to the backend. */
  resetDirty: () => void;
  /** Saved state as a wire Document (drafts excluded). */
  toDocument: () => Document;
}

export type EditorStoreState = EditorState & EditorActions;

export interface EditorStoreDeps {
  createId: () => string;
}

const defaultDeps: EditorStoreDeps = { createId: () => crypto.randomUUID() };

/** Creates an independent store instance (tests, playground, future multi-doc). */
export function createEditorStore(deps: EditorStoreDeps = defaultDeps) {
  return createStore<EditorStoreState>()((set, get) => {
    const dispatch = (action: EditorAction) => set((state) => editorReducer(state, action));

    return {
      ...createInitialState(),
      dispatch,
      loadDocument: (document) => dispatch({ type: 'loadDocument', ...fromDocument(document, deps.createId) }),
      addModule: (title = 'New module') => {
        const module = createModule(deps.createId(), title);
        dispatch({ type: 'addModule', module });
        return module.id;
      },
      removeModule: (moduleId) => dispatch({ type: 'removeModule', moduleId }),
      selectModule: (moduleId) => dispatch({ type: 'selectModule', moduleId }),
      updateModuleDraft: (moduleId, patch) => dispatch({ type: 'updateModuleDraft', moduleId, patch }),
      commitModule: (moduleId) => dispatch({ type: 'commitModule', moduleId }),
      revertModule: (moduleId) => dispatch({ type: 'revertModule', moduleId }),
      addComponent: (moduleId, type) => {
        if (!get().saved[moduleId]) return null;
        const component = createComponent(type, deps.createId());
        dispatch({ type: 'addComponent', moduleId, component });
        return component.key;
      },
      updateComponent: (moduleId, key, params) => dispatch({ type: 'updateComponent', moduleId, key, params }),
      removeComponent: (moduleId, key) => dispatch({ type: 'removeComponent', moduleId, key }),
      resetDirty: () => dispatch({ type: 'resetDirty' }),
      toDocument: () => toDocument(get()),
    };
  });
}

export type EditorStore = ReturnType<typeof createEditorStore>;

/** The app-wide editor store. Callable outside React: editorStore.getState().addModule(). */
export const editorStore = createEditorStore();

/** React hook. Selectors returning new arrays/objects need useShallow (or a memoized selector). */
export function useEditorStore<T>(selector: (state: EditorStoreState) => T): T {
  return useStore(editorStore, selector);
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __editorStore?: EditorStore }).__editorStore = editorStore;
}
