import type { Uuid } from '../../api/documentTypes';
import type { EditorAction } from './actions';
import { createEmptyMeta } from './factories';
import type {
  ComponentParamsPatch,
  EditorComponent,
  EditorModule,
  EditorState,
  ModuleDraftPatch,
} from './types';

export function createInitialState(): EditorState {
  return {
    meta: createEmptyMeta(),
    order: [],
    saved: {},
    drafts: {},
    selectedModuleId: null,
    dirty: false,
  };
}

/**
 * Pure editor reducer. No-op actions (unknown id, nothing to commit…) return
 * the same state reference, so subscribers are not notified.
 */
export function editorReducer<S extends EditorState>(state: S, action: EditorAction): S {
  switch (action.type) {
    case 'loadDocument':
      return {
        ...state,
        meta: action.meta,
        order: action.modules.map((m) => m.id),
        saved: Object.fromEntries(action.modules.map((m) => [m.id, m])),
        drafts: {},
        selectedModuleId: null,
        dirty: false,
      };

    case 'addModule': {
      const { module } = action;
      if (state.saved[module.id]) return state;
      return {
        ...state,
        order: [...state.order, module.id],
        saved: { ...state.saved, [module.id]: module },
        selectedModuleId: module.id,
        dirty: true,
      };
    }

    case 'removeModule': {
      const { moduleId } = action;
      if (!state.saved[moduleId]) return state;
      return {
        ...state,
        order: state.order.filter((id) => id !== moduleId),
        saved: omit(state.saved, moduleId),
        drafts: omit(state.drafts, moduleId),
        selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
        dirty: true,
      };
    }

    case 'selectModule': {
      const { moduleId } = action;
      if (moduleId === state.selectedModuleId) return state;
      if (moduleId !== null && !state.saved[moduleId]) return state;
      return { ...state, selectedModuleId: moduleId };
    }

    case 'updateModuleDraft':
      return withDraft(state, action.moduleId, (m) => applyModulePatch(m, action.patch));

    case 'commitModule': {
      const draft = state.drafts[action.moduleId];
      if (!draft) return state;
      return {
        ...state,
        saved: { ...state.saved, [draft.id]: draft },
        drafts: omit(state.drafts, draft.id),
        dirty: true,
      };
    }

    case 'revertModule':
      if (!state.drafts[action.moduleId]) return state;
      return { ...state, drafts: omit(state.drafts, action.moduleId) };

    case 'addComponent':
      return withDraft(state, action.moduleId, (m) => ({
        ...m,
        components: [...m.components, action.component],
      }));

    case 'updateComponent':
      return withDraft(state, action.moduleId, (m) => {
        const index = m.components.findIndex((c) => c.key === action.key);
        if (index === -1) return m;
        const components = [...m.components];
        components[index] = applyParamsPatch(components[index], action.params);
        return { ...m, components };
      });

    case 'removeComponent':
      return withDraft(state, action.moduleId, (m) => {
        if (!m.components.some((c) => c.key === action.key)) return m;
        return { ...m, components: m.components.filter((c) => c.key !== action.key) };
      });

    case 'resetDirty':
      return state.dirty ? { ...state, dirty: false } : state;

    default:
      action satisfies never;
      return state;
  }
}

// ---- helpers ---------------------------------------------------------------

/** Applies `update` to the module's draft, creating the draft from the saved module if needed. */
function withDraft<S extends EditorState>(
  state: S,
  moduleId: Uuid,
  update: (module: EditorModule) => EditorModule,
): S {
  const base = state.drafts[moduleId] ?? state.saved[moduleId];
  if (!base) return state;
  const next = update(base);
  if (next === base) return state;
  return { ...state, drafts: { ...state.drafts, [moduleId]: next } };
}

function applyModulePatch(module: EditorModule, patch: ModuleDraftPatch): EditorModule {
  const { parameters, ...rest } = patch;
  return {
    ...module,
    ...definedOnly(rest),
    parameters: parameters
      ? {
          ...module.parameters,
          ...definedOnly(parameters),
          frame: { ...module.parameters.frame, ...definedOnly(parameters.frame ?? {}) },
        }
      : module.parameters,
  };
}

function applyParamsPatch(component: EditorComponent, patch: ComponentParamsPatch): EditorComponent {
  const known: ComponentParamsPatch = Object.fromEntries(
    Object.entries(patch).filter(([name, value]) => name in component.params && value !== undefined),
  );
  return { ...component, params: { ...component.params, ...known } } as EditorComponent;
}

function omit<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!(key in record)) return record;
  const next = { ...record };
  delete next[key];
  return next;
}

function definedOnly<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
