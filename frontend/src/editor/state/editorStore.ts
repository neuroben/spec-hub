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
  undo: () => void;
  redo: () => void;
  loadDocument: (document: Document) => void;
  /** Apply server metadata without dropping edits made while saving. */
  acknowledgeSave: (document: Document, snapshot: Pick<EditorStoreState, 'meta' | 'order' | 'saved' | 'loadVersion'>, assignModuleIds?: boolean) => void;
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
  addComponent: (moduleId: Uuid, type: ComponentType, index?: number, editable?: boolean, createdInDocument?: boolean) => ComponentKey | null;
  /**
   * Palette insert: after the component open in the inspector (if it is in this module),
   * otherwise at the end; then opens the new component's settings.
   */
  insertComponent: (moduleId: Uuid, type: ComponentType, editable?: boolean, createdInDocument?: boolean) => ComponentKey | null;
  moveComponent: (moduleId: Uuid, key: ComponentKey, toIndex: number) => void;
  updateComponent: (moduleId: Uuid, key: ComponentKey, params: ComponentParamsPatch) => void;
  removeComponent: (moduleId: Uuid, key: ComponentKey) => void;
  /** Call after the document was saved to the backend. */
  resetDirty: () => void;
  /** Saved state as a wire Document (drafts excluded). */
  toDocument: () => Document;
}

type EditorSnapshot = Pick<EditorState, 'meta' | 'order' | 'saved' | 'drafts' | 'dirty'>;
const MAX_HISTORY = 100;

export type EditorStoreState = EditorState & EditorActions & {
  canUndo: boolean;
  canRedo: boolean;
  historyPast: EditorSnapshot[];
  historyFuture: EditorSnapshot[];
  loadVersion: number;
};

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
    const dispatch = (action: EditorAction) => set((state) => {
      const next = editorReducer(state, action);
      if (next === state) return state;
      if (action.type === 'loadDocument') {
        return { ...next, historyPast: [], historyFuture: [], canUndo: false, canRedo: false, loadVersion: state.loadVersion + 1 };
      }

      const contentChanged = state.meta !== next.meta || state.order !== next.order ||
        state.saved !== next.saved || state.drafts !== next.drafts;
      if (!contentChanged || action.type === 'resetDirty' || action.type === 'commitModule') return next;

      const snapshot = snapshotOf(state);
      const historyPast = [...state.historyPast, snapshot].slice(-MAX_HISTORY);
      return { ...next, historyPast, historyFuture: [], canUndo: true, canRedo: false };
    });

    const undo = () => set((state) => {
      if (state.historyPast.length === 0) return state;
      const snapshot = state.historyPast[state.historyPast.length - 1];
      const historyPast = state.historyPast.slice(0, -1);
      const historyFuture = [...state.historyFuture, snapshotOf(state)];
      const restored = restoreSnapshot(state, snapshot);
      return { ...restored, historyPast, historyFuture, canUndo: historyPast.length > 0, canRedo: true };
    });

    const redo = () => set((state) => {
      if (state.historyFuture.length === 0) return state;
      const snapshot = state.historyFuture[state.historyFuture.length - 1];
      const historyFuture = state.historyFuture.slice(0, -1);
      const historyPast = [...state.historyPast, snapshotOf(state)];
      const restored = restoreSnapshot(state, snapshot);
      return { ...restored, historyPast, historyFuture, canUndo: true, canRedo: historyFuture.length > 0 };
    });

    return {
      ...initialState,
      historyPast: [],
      historyFuture: [],
      canUndo: false,
      canRedo: false,
      loadVersion: 0,
      dispatch,
      undo,
      redo,
      loadDocument: (document) => dispatch({ type: 'loadDocument', ...fromDocument(document, deps.createId) }),
      acknowledgeSave: (document, snapshot, assignModuleIds = false) => set((state) => {
        if (state.loadVersion !== snapshot.loadVersion) return state;
        const { modules, ...meta } = document;
        const ids = new Map(assignModuleIds ? snapshot.order.map((id, i) => [id, modules[i]?.id ?? id]) : []);
        const remapModules = (record: EditorState['saved']) => ids.size === 0 ? record : Object.fromEntries(
          Object.entries(record).map(([id, module]) => [ids.get(id) ?? id, { ...module, id: ids.get(id) ?? id }]),
        );
        const rebase = (entry: EditorSnapshot): EditorSnapshot => ({
          ...entry,
          meta: { ...meta, title: entry.meta.title },
          order: ids.size === 0 ? entry.order : entry.order.map((id) => ids.get(id) ?? id),
          saved: remapModules(entry.saved),
          drafts: remapModules(entry.drafts),
          dirty: true,
        });
        return {
          ...rebase(state),
          meta: { ...meta, title: state.meta.title === snapshot.meta.title ? meta.title : state.meta.title },
          dirty: state.meta !== snapshot.meta || state.order !== snapshot.order || state.saved !== snapshot.saved,
          selectedModuleId: ids.get(state.selectedModuleId ?? '') ?? state.selectedModuleId,
          inspector: state.inspector ? { ...state.inspector, moduleId: ids.get(state.inspector.moduleId) ?? state.inspector.moduleId } : null,
          historyPast: state.historyPast.map(rebase),
          historyFuture: state.historyFuture.map(rebase),
        };
      }),
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
      addComponent: (moduleId, type, index, editable = false, createdInDocument = false) => {
        if (!get().saved[moduleId]) return null;
        const component = createComponent(type, deps.createId(), editable, createdInDocument);
        dispatch({ type: 'addComponent', moduleId, component, index });
        return component.key;
      },
      insertComponent: (moduleId, type, editable = false, createdInDocument = false) => {
        const state = get();
        const target = state.inspector;
        let index: number | undefined;
        if (target?.kind === 'component' && target.moduleId === moduleId) {
          const position = selectModule(state, moduleId)?.components.findIndex((c) => c.key === target.key) ?? -1;
          if (position !== -1) index = position + 1;
        }
        const key = state.addComponent(moduleId, type, index, editable, createdInDocument);
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

function snapshotOf(state: EditorState): EditorSnapshot {
  return { meta: state.meta, order: state.order, saved: state.saved, drafts: state.drafts, dirty: state.dirty };
}

function restoreSnapshot(state: EditorStoreState, snapshot: EditorSnapshot): EditorState {
  const selectedModuleId = snapshot.order.includes(state.selectedModuleId ?? '') ? state.selectedModuleId : null;
  const restored = { ...state, ...snapshot, selectedModuleId };
  const target = restored.inspector;
  if (!target) return restored;
  const module = restored.drafts[target.moduleId] ?? restored.saved[target.moduleId];
  const exists = target.kind === 'module'
    ? Boolean(module)
    : Boolean(module?.components.some((component) => component.key === target.key));
  return exists ? restored : { ...restored, inspector: null };
}

export type EditorStore = ReturnType<typeof createEditorStore>;
