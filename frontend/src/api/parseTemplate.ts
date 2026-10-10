import { DocumentValidationError, parseDocument } from './parseDocument';
import type { Document } from './documentTypes';

/**
 * C# property name → internal key. GET /api/Template/{id} returns
 * DocumentTemplateDetailsDto serialized with C# names (PascalCase), except the
 * [JsonPropertyName]-pinned keys which already match the internal shape
 * (created_at, created_by, last_modified, can_copy, params) and the "type"
 * discriminator. Unknown keys pass through untouched.
 */
const KEY_MAP: Record<string, string> = {
  Id: 'id',
  Title: 'title',
  Version: 'version',
  Modules: 'modules',
  Parameters: 'parameters',
  Color: 'color',
  Margin: 'margin',
  Frame: 'frame',
  Visible: 'visible',
  Type: 'type',
  Width: 'width',
  Rounded: 'rounded',
  Owners: 'owners',
  Comments: 'comments',
  Components: 'components',
  Editable: 'editable',
  Content: 'content',
  Answer: 'answer',
};

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[KEY_MAP[key] ?? key] = normalize(entry);
    }
    return out;
  }
  return value;
}

/**
 * Parses a GET template-details response into an internal Document.
 * Template modules carry no id on the wire, so fresh client-side ids are
 * assigned via `createId`. Throws DocumentValidationError on mismatch.
 */
export function parseTemplateDetails(value: unknown, createId: () => string): Document {
  const normalized = normalize(value) as Record<string, unknown>;
  if (typeof normalized !== 'object' || normalized === null || Array.isArray(normalized)) {
    throw new DocumentValidationError('$', `expected object, got ${normalized === null ? 'null' : typeof normalized}`);
  }
  if (Array.isArray(normalized.modules)) {
    for (const module of normalized.modules) {
      if (typeof module === 'object' && module !== null && !('id' in module)) {
        (module as Record<string, unknown>).id = createId();
      }
    }
  }
  return parseDocument(normalized);
}
