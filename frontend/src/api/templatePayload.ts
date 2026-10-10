import type { ComponentType, FrameType } from './documentTypes';

/**
 * Template save payload — mirrors the backend Template DTOs exactly
 * (TemplateController + Create/UpdateDocumentTemplateDto + TemplateModuleDto).
 *
 * Backend decisions (do not "fix" these client-side):
 * - Module ids are client-side only: TemplateModuleDto has no id — it is dropped on save.
 * - `owners` / `comments` must be present but only as empty arrays (controller rejects them with 400 otherwise).
 * - `version` / `last_modified` are server-owned (create → 1 + UtcNow, update → current + 1).
 * - Casing: ASP.NET Core serializes C# property names as-is (PascalCase), except keys
 *   pinned with [JsonPropertyName]: created_at, created_by, last_modified, can_copy,
 *   params, module_id — plus the polymorphic "type" discriminator. POST binding is
 *   case-insensitive, but we send backend-exact keys so Preview JSON matches GET responses.
 */

export interface TemplateFramePayload {
  Visible: boolean;
  Color: string;
  Type: FrameType;
  Width: string;
  Rounded: string;
}

export interface TemplateParametersPayload {
  can_copy: boolean;
  Color: string;
  Margin: number[];
  Frame: TemplateFramePayload;
}

export interface TemplateComponentParamsPayload {
  Editable: boolean;
  Color: string;
  Content: string;
  /** Only on true_false. */
  Answer?: boolean;
}

export interface TemplateComponentPayload {
  /** Polymorphic discriminator: "title" | "paragraph" | "true_false". */
  type: ComponentType;
  params: TemplateComponentParamsPayload;
}

export interface TemplateModulePayload {
  Title: string;
  Parameters: TemplateParametersPayload;
  Owners: string[];
  Comments: string[];
  Components: TemplateComponentPayload[];
}

/** POST /api/Template?userId=… */
export interface CreateTemplatePayload {
  Title: string;
  Modules: TemplateModulePayload[];
}

/** PUT /api/Template?userId=… */
export interface UpdateTemplatePayload {
  Id: string;
  Title: string;
  Modules: TemplateModulePayload[];
}

export type AnyTemplatePayload = CreateTemplatePayload | UpdateTemplatePayload;

/**
 * Client-side validation of a save payload. Returns human-readable errors;
 * the caller shows them instead of sending the request. Empty modules list is
 * allowed (the backend accepts it) — it is the user's explicit choice.
 */
export function validateTemplatePayload(payload: AnyTemplatePayload): string[] {
  const errors: string[] = [];

  if (payload.Title.trim() === '') {
    errors.push('Document title is required.');
  }

  payload.Modules.forEach((module, i) => {
    const label = module.Title.trim() === '' ? `Module ${i + 1}` : `Module "${module.Title}"`;
    if (module.Title.trim() === '') {
      errors.push(`${label}: title is required.`);
    }
    if (module.Parameters.Margin.length !== 2) {
      errors.push(`${label}: margin must have exactly 2 numbers.`);
    }
    module.Components.forEach((component, j) => {
      if (component.type !== 'title' && component.type !== 'paragraph' && component.type !== 'true_false') {
        errors.push(`${label}, component ${j + 1}: unknown type "${String(component.type)}".`);
      } else if (component.type === 'true_false' && typeof component.params.Answer !== 'boolean') {
        errors.push(`${label}, component ${j + 1}: true/false answer is missing.`);
      }
    });
  });

  return errors;
}
