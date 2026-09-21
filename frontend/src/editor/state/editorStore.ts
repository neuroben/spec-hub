import { createStore } from 'zustand/vanilla';
import type { ComponentType, Document, Uuid } from '../../api/documentTypes';
import type { EditorAction } from './actions';
import { createInitialState, editorReducer } from './editorReducer';
import { createComponent, createModule } from './factories';
import { selectModule } from './selectors';
import { fromDocument, toDocument } from './serialize';
import type {
  ComponentKey,
  ComponentParamsPatch,
  DocumentMetaPatch,
  EditorState,
  ModuleDraftPatch,
} from './types';

export interface EditorActions {
  dispatch: (action: EditorAction) => void;
  loadDocument: (document: Document) => void;
  /** Adds an empty module, selects it and returns its id. */
  addModule: (title?: string) => Uuid;
  removeModule: (moduleId: Uuid) => void;
  /** Reorders modules (drag-and-drop / up-down). Marks the document dirty. */
  moveModule: (moduleId: Uuid, toIndex: number) => void;
  selectModule: (moduleId: Uuid | null) => void;
  /** Selects the module and opens its settings in the inspector. */
  openModuleSettings: (moduleId: Uuid) => void;
  /** Selects the component's module and opens the component settings in the inspector. */
  openComponentSettings: (moduleId: Uuid, key: ComponentKey) => void;
  closeInspector: () => void;
  /** Document-level fields (title). Marks the document dirty. */
  updateMeta: (patch: DocumentMetaPatch) => void;
  updateModuleDraft: (moduleId: Uuid, patch: ModuleDraftPatch) => void;
  /** Save: draft → saved. */
  commitModule: (moduleId: Uuid) => void;
  /** Cancel: drops the draft. */
  revertModule: (moduleId: Uuid) => void;
  /**
   * Adds a component with default params to the module's draft (at `index`, default: end).
   * Returns its key, or null if the module does not exist.
   */
  addComponent: (moduleId: Uuid, type: ComponentType, index?: number) => ComponentKey | null;
  /**
   * Palette insert: after the component open in the inspector (if it is in this module),
   * otherwise at the end; then opens the new component's settings.
   */
  insertComponent: (moduleId: Uuid, type: ComponentType) => ComponentKey | null;
  moveComponent: (moduleId: Uuid, key: ComponentKey, toIndex: number) => void;
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
      moveModule: (moduleId, toIndex) => dispatch({ type: 'moveModule', moduleId, toIndex }),
      selectModule: (moduleId) => dispatch({ type: 'selectModule', moduleId }),
      openModuleSettings: (moduleId) => dispatch({ type: 'openModuleSettings', moduleId }),
      openComponentSettings: (moduleId, key) => dispatch({ type: 'openComponentSettings', moduleId, key }),
      closeInspector: () => dispatch({ type: 'closeInspector' }),
      updateMeta: (patch) => dispatch({ type: 'updateMeta', patch }),
      updateModuleDraft: (moduleId, patch) => dispatch({ type: 'updateModuleDraft', moduleId, patch }),
      commitModule: (moduleId) => dispatch({ type: 'commitModule', moduleId }),
      revertModule: (moduleId) => dispatch({ type: 'revertModule', moduleId }),
      addComponent: (moduleId, type, index) => {
        if (!get().saved[moduleId]) return null;
        const component = createComponent(type, deps.createId());
        dispatch({ type: 'addComponent', moduleId, component, index });
        return component.key;
      },
      insertComponent: (moduleId, type) => {
        const state = get();
        const target = state.inspector;
        let index: number | undefined;
        if (target?.kind === 'component' && target.moduleId === moduleId) {
          const position = selectModule(state, moduleId)?.components.findIndex((c) => c.key === target.key) ?? -1;
          if (position !== -1) index = position + 1;
        }
        const key = state.addComponent(moduleId, type, index);
        if (key) get().openComponentSettings(moduleId, key);
        return key;
      },
      moveComponent: (moduleId, key, toIndex) => dispatch({ type: 'moveComponent', moduleId, key, toIndex }),
      updateComponent: (moduleId, key, params) => dispatch({ type: 'updateComponent', moduleId, key, params }),
      removeComponent: (moduleId, key) => dispatch({ type: 'removeComponent', moduleId, key }),
      resetDirty: () => dispatch({ type: 'resetDirty' }),
      toDocument: () => toDocument(get()),
    };
  });
}

export type EditorStore = ReturnType<typeof createEditorStore>;
