import type { ComponentType, ModuleParameters, Uuid } from '../../api/documentTypes';
import type { ComponentKey, DocumentMeta, EditorComponent, EditorModule } from './types';

// Defaults mirror the backend's parameterless constructors (feat/api-datamodel).

export function createEmptyMeta(): DocumentMeta {
  return { id: '', title: '', version: 0, created_at: '', created_by: '', last_modified: '' };
}

export function createModuleParameters(): ModuleParameters {
  return {
    can_copy: false,
    color: '',
    margin: [0, 0],
    frame: { visible: false, color: '', type: 'None', width: '0px', rounded: '0px' },
  };
}

export function createModule(id: Uuid, title = ''): EditorModule {
  return {
    id,
    title,
    parameters: createModuleParameters(),
    owners: [],
    comments: [],
    components: [],
  };
}

export function createComponent(type: ComponentType, key: ComponentKey): EditorComponent {
  const base = { color: '', editable: false, content: '' };
  switch (type) {
    case 'title':
      return { key, type, params: { ...base } };
    case 'paragraph':
      return { key, type, params: { ...base } };
    case 'true_false':
      return { key, type, params: { ...base, answer: false } };
  }
}
