import type { Component, Document } from '../../api/documentTypes';
import type { ComponentKey, DocumentMeta, EditorComponent, EditorModule, EditorState } from './types';

/** Wire Document → editor modules (adds client-side component keys). */
export function fromDocument(
  document: Document,
  createKey: () => ComponentKey,
): { meta: DocumentMeta; modules: EditorModule[] } {
  const { modules, ...meta } = document;
  return {
    meta,
    modules: modules.map((module) => ({
      ...module,
      components: module.components.map((c) => ({ ...c, key: createKey() }) as EditorComponent),
    })),
  };
}

export function stripKey(component: EditorComponent): Component {
  const { key, ...rest } = component;
  void key;
  return rest as Component;
}

/** Editor state → wire Document. Only saved (committed) modules; drafts are excluded. */
export function toDocument(state: EditorState): Document {
  return {
    ...state.meta,
    modules: state.order.map((id) => {
      const module = state.saved[id];
      return { ...module, components: module.components.map(stripKey) };
    }),
  };
}
