import type { Uuid } from '../../api/documentTypes';
import type { EditorModule, EditorState } from './types';

/** The module as it should be displayed: draft if one exists, otherwise saved. */
export function selectModule(state: EditorState, moduleId: Uuid): EditorModule | undefined {
  return state.drafts[moduleId] ?? state.saved[moduleId];
}

let lastModulesInput: [EditorState['order'], EditorState['saved'], EditorState['drafts']] | null = null;
let lastModules: EditorModule[] = [];

/**
 * Ordered modules with drafts overlaid (live preview on the canvas).
 * Memoized on (order, saved, drafts), so it is safe as a zustand selector
 * without useShallow.
 */
export function selectModules(state: EditorState): EditorModule[] {
  const input = lastModulesInput;
  if (input && input[0] === state.order && input[1] === state.saved && input[2] === state.drafts) {
    return lastModules;
  }
  lastModulesInput = [state.order, state.saved, state.drafts];
  lastModules = state.order.map((id) => state.drafts[id] ?? state.saved[id]);
  return lastModules;
}

export function selectSelectedModule(state: EditorState): EditorModule | undefined {
  return state.selectedModuleId === null ? undefined : selectModule(state, state.selectedModuleId);
}

export function selectHasDraft(state: EditorState, moduleId: Uuid): boolean {
  return moduleId in state.drafts;
}

export function selectIsDirty(state: EditorState): boolean {
  return state.dirty;
}
