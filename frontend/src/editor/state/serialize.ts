import type { Component, Document } from '../../api/documentTypes';
import type {
  CreateTemplatePayload,
  TemplateModulePayload,
  UpdateTemplatePayload,
} from '../../api/templatePayload';
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

function toTemplateModule(module: EditorModule): TemplateModulePayload {
  const { parameters } = module;
  return {
    Title: module.title,
    Parameters: {
      can_copy: parameters.can_copy,
      Color: parameters.color,
      Margin: [...parameters.margin],
      Frame: {
        Visible: parameters.frame.visible,
        Color: parameters.frame.color,
        Type: parameters.frame.type,
        Width: parameters.frame.width,
        Rounded: parameters.frame.rounded,
      },
    },
    // The controller rejects non-empty owners/comments with 400; the template editor never sets them.
    Owners: [],
    Comments: [],
    Components: module.components.map((component) => {
      const { color, editable, content } = component.params;
      return {
        type: component.type,
        params:
          component.type === 'true_false'
            ? { Editable: editable, Color: color, Content: content, Answer: component.params.answer }
            : { Editable: editable, Color: color, Content: content },
      };
    }),
  };
}

function committedModules(state: EditorState): TemplateModulePayload[] {
  return state.order.flatMap((id) => {
    const module = state.saved[id];
    return module ? [toTemplateModule(module)] : [];
  });
}

/** Editor state → POST /api/Template body. Client-side module ids are dropped (the wire has none). */
export function toCreateTemplatePayload(state: EditorState): CreateTemplatePayload {
  return { Title: state.meta.title, Modules: committedModules(state) };
}

/** Editor state → PUT /api/Template body. Version is bumped by the server, not the client. */
export function toUpdateTemplatePayload(state: EditorState): UpdateTemplatePayload {
  return { Id: state.meta.id, Title: state.meta.title, Modules: committedModules(state) };
}
