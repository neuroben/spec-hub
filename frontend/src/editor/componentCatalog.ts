import type { ComponentType } from '../api/documentTypes';

export interface CatalogEntry {
  id: string;
  label: string;
  /** Present when the component can be inserted (exists in the JSON contract). */
  type?: ComponentType;
}

/**
 * Palette entries shown in the left panel. Entries without `type` are not supported yet.
 * Decision (D4): the backend `ComponentType` enum only knows Title, Paragraph and
 * TrueOrFalse, so Table and Image Box stay disabled with a "Coming soon" tooltip
 * until the backend enum + `schema_plan.json` grow matching variants.
 */
export const COMPONENT_CATALOG: readonly CatalogEntry[] = [
  { id: 'title', label: 'Title box', type: 'title' },
  { id: 'paragraph', label: 'Text box', type: 'paragraph' },
  { id: 'true_false', label: 'True / False', type: 'true_false' },
  { id: 'table', label: 'Table' },
  { id: 'image', label: 'Image box' },
];

/** Display label of a component type, e.g. "Text box" for paragraph. */
export function componentLabel(type: ComponentType): string {
  return COMPONENT_CATALOG.find((entry) => entry.type === type)?.label ?? type;
}
