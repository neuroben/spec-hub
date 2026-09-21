import type {
  Component,
  Document,
  Module,
  ModuleFrame,
  ModuleParameters,
  TrueFalseParams,
  Uuid,
} from '../../api/documentTypes';

/** Client-side component key. Components have no id on the wire. */
export type ComponentKey = string;

/** A wire component plus a stable client-side key (stripped by toDocument). */
export type EditorComponent = Component & { key: ComponentKey };

export type EditorModule = Omit<Module, 'components'> & {
  components: EditorComponent[];
};

/** Document without its modules: id, version, created_at, created_by, last_modified. */
export type DocumentMeta = Omit<Document, 'modules'>;

export interface EditorState {
  meta: DocumentMeta;
  /** Module order on the canvas. */
  order: Uuid[];
  /** Committed (Save-d) modules. */
  saved: Record<Uuid, EditorModule>;
  /** Uncommitted edits. Present only for modules being edited; Cancel deletes the entry. */
  drafts: Record<Uuid, EditorModule>;
  selectedModuleId: Uuid | null;
  /** True when saved state differs from the last loadDocument / resetDirty (i.e. not yet sent to the backend). */
  dirty: boolean;
}

/** Deep-partial patch for a module draft. Components are changed via component actions. */
export interface ModuleDraftPatch {
  title?: string;
  owners?: string[];
  comments?: string[];
  parameters?: Partial<Omit<ModuleParameters, 'frame'>> & {
    frame?: Partial<ModuleFrame>;
  };
}

/**
 * Patch for component params. Covers the keys of every component type;
 * keys the target component does not have (e.g. `answer` on a paragraph) are ignored.
 */
export type ComponentParamsPatch = Partial<TrueFalseParams>;
