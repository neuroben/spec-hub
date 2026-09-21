import type { Uuid } from '../../api/documentTypes';
import type { EditorAction } from './actions';
import { createEmptyMeta } from './factories';
import type {
  ComponentParamsPatch,
  EditorComponent,
  EditorModule,
  EditorState,
  InspectorTarget,
  ModuleDraftPatch,
} from './types';

export function createInitialState(): EditorState {
  return {
    meta: createEmptyMeta(),
    order: [],
    saved: {},
    drafts: {},
    selectedModuleId: null,
    inspector: null,
    dirty: false,
  };
}

/**
 * Pure editor reducer. No-op actions (unknown id, nothing to commit…) return
 * the same state reference, so subscribers are not notified.
 * After every change the inspector target is re-validated: if the module or
 * component it points at no longer exists (removed, discarded draft…), it closes.
 */
export function editorReducer<S extends EditorState>(state: S, action: EditorAction): S {
  const next = reduce(state, action);
  return next === state ? state : reconcileInspector(next);
}

function reduce<S extends EditorState>(state: S, action: EditorAction): S {
  switch (action.type) {
    case 'loadDocument':
      return {
        ...state,
        meta: action.meta,
        order: action.modules.map((m) => m.id),
        saved: Object.fromEntries(action.modules.map((m) => [m.id, m])),
        drafts: {},
        selectedModuleId: null,
        inspector: null,
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

    case 'moveModule': {
      // Order is document-level (not part of a module draft): applied to the saved state directly.
      const from = state.order.indexOf(action.moduleId);
      if (from === -1) return state;
      const to = clamp(action.toIndex, 0, state.order.length - 1);
      if (to === from) return state;
      const order = [...state.order];
      order.splice(from, 1);
      order.splice(to, 0, action.moduleId);
      return { ...state, order, dirty: true };
    }

    case 'selectModule': {
      const { moduleId } = action;
      if (moduleId === state.selectedModuleId) return state;
      if (moduleId !== null && !state.saved[moduleId]) return state;
      return { ...state, selectedModuleId: moduleId };
    }

    case 'openModuleSettings': {
      const { moduleId } = action;
      if (!state.saved[moduleId]) return state;
      return openInspector(state, { kind: 'module', moduleId });
    }

    case 'openComponentSettings': {
      const { moduleId, key } = action;
      const module = state.drafts[moduleId] ?? state.saved[moduleId];
      if (!module?.components.some((c) => c.key === key)) return state;
      return openInspector(state, { kind: 'component', moduleId, key });
    }

    case 'closeInspector':
      return state.inspector === null ? state : { ...state, inspector: null };

    case 'updateMeta': {
      const patch = definedOnly(action.patch);
      const changed = (Object.keys(patch) as (keyof typeof patch)[]).some((k) => patch[k] !== state.meta[k]);
      if (!changed) return state;
      return { ...state, meta: { ...state.meta, ...patch }, dirty: true };
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
      return withDraft(state, action.moduleId, (m) => {
        const components = [...m.components];
        const index = action.index === undefined ? components.length : clamp(action.index, 0, components.length);
        components.splice(index, 0, action.component);
        return { ...m, components };
      });

    case 'moveComponent':
      return withDraft(state, action.moduleId, (m) => {
        const from = m.components.findIndex((c) => c.key === action.key);
        if (from === -1) return m;
        const to = clamp(action.toIndex, 0, m.components.length - 1);
        if (to === from) return m;
        const components = [...m.components];
        const [moved] = components.splice(from, 1);
        components.splice(to, 0, moved);
        return { ...m, components };
      });

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

function openInspector<S extends EditorState>(state: S, target: InspectorTarget): S {
  if (sameTarget(state.inspector, target) && state.selectedModuleId === target.moduleId) return state;
  return { ...state, selectedModuleId: target.moduleId, inspector: target };
}

function sameTarget(a: InspectorTarget | null, b: InspectorTarget): boolean {
  if (!a || a.kind !== b.kind || a.moduleId !== b.moduleId) return false;
  return a.kind === 'module' || (b.kind === 'component' && a.key === b.key);
}

/** Closes the inspector if its target no longer exists. */
function reconcileInspector<S extends EditorState>(state: S): S {
  const target = state.inspector;
  if (!target) return state;
  const module = state.drafts[target.moduleId] ?? state.saved[target.moduleId];
  const exists = target.kind === 'module'
    ? Boolean(module)
    : Boolean(module?.components.some((c) => c.key === target.key));
  return exists ? state : { ...state, inspector: null };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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
