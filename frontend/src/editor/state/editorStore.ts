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

export interface EditorStoreOptions {
  /** Id/key generator (default: crypto.randomUUID). Inject a deterministic one in tests. */
  createId?: () => string;
  /** Becomes part of the store's *initial* state (also used as the SSR/getInitialState snapshot). */
  initialDocument?: Document;
}

/** Creates an independent store instance (one per EditorStoreProvider; tests; playground). */
export function createEditorStore({
  createId = () => crypto.randomUUID(),
  initialDocument,
}: EditorStoreOptions = {}) {
  const deps = { createId };
  const initialState = initialDocument
    ? editorReducer(createInitialState(), { type: 'loadDocument', ...fromDocument(initialDocument, createId) })
    : createInitialState();

  return createStore<EditorStoreState>()((set, get) => {
    const dispatch = (action: EditorAction) => set((state) => editorReducer(state, action));

    return {
      ...initialState,
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
