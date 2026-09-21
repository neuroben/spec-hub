/**
 * Document JSON contract – single source of truth for the frontend.
 *
 * Mirrors the backend wire format (feat/api-datamodel: Document.cs, Module.cs,
 * ModuleParameters.cs, ModuleFrame.cs, Component.cs + derived components).
 * The root schema_plan.json has been aligned to the backend as well.
 *
 * Wire notes:
 * - Property names are camelCase (ASP.NET Core web defaults), except the ones
 *   pinned with [JsonPropertyName]: created_at, created_by, last_modified, can_copy, params.
 * - Enums are serialized by name (JsonStringEnumConverter, no naming policy) → PascalCase.
 * - Components are polymorphic on "type": "title" | "paragraph" | "true_false".
 * - Components have no id on the wire; editors need a client-side key.
 * - Document.title is ahead of the backend (requested, see the field comment).
 */

/** Guid serialized as string. */
export type Uuid = string;
/** DateTime serialized as ISO-8601 string. */
export type IsoDateTime = string;

// ---- Module frame ---------------------------------------------------------

export const FRAME_TYPES = ['None', 'Solid', 'Dashed', 'Dotted'] as const;
export type FrameType = (typeof FRAME_TYPES)[number];

export interface ModuleFrame {
  visible: boolean;
  color: string;
  type: FrameType;
  /** CSS length, e.g. "2px". */
  width: string;
  /** CSS border-radius, e.g. "5px". */
  rounded: string;
}

export interface ModuleParameters {
  can_copy: boolean;
  color: string;
  /** int[] on the backend (schema example: [1, 2]). */
  margin: number[];
  frame: ModuleFrame;
}

// ---- Components (discriminated union on `type`) ---------------------------

export const COMPONENT_TYPES = ['title', 'paragraph', 'true_false'] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

interface BaseComponentParams {
  color: string;
  editable: boolean;
  content: string;
}

export type TitleParams = BaseComponentParams;
export type ParagraphParams = BaseComponentParams;
export interface TrueFalseParams extends BaseComponentParams {
  answer: boolean;
}

export interface TitleComponent {
  type: 'title';
  params: TitleParams;
}

export interface ParagraphComponent {
  type: 'paragraph';
  params: ParagraphParams;
}

export interface TrueFalseComponent {
  type: 'true_false';
  params: TrueFalseParams;
}

export type Component = TitleComponent | ParagraphComponent | TrueFalseComponent;

/** Narrow the union by discriminator, e.g. ComponentOf<'true_false'>. */
export type ComponentOf<T extends ComponentType> = Extract<Component, { type: T }>;

// ---- Module / Document ----------------------------------------------------

export interface Module {
  id: Uuid;
  title: string;
  parameters: ModuleParameters;
  /** User ids. */
  owners: string[];
  /** Comment ids. */
  comments: string[];
  components: Component[];
}

export interface Document {
  id: Uuid;
  /**
   * Document title.
   * PENDING BACKEND: not yet in Document.cs — requested from the backend team.
   * Until it lands, the backend ignores it on POST and omits it on GET.
   */
  title: string;
  version: number;
  created_at: IsoDateTime;
  created_by: string;
  last_modified: IsoDateTime;
  modules: Module[];
}
