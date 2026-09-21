import {
  COMPONENT_TYPES,
  FRAME_TYPES,
  type Component,
  type Document,
  type Module,
  type ModuleFrame,
  type ModuleParameters,
} from './documentTypes';

/** Thrown when unknown JSON does not match the Document contract. `path` points at the first problem. */
export class DocumentValidationError extends Error {
  readonly path: string;
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'DocumentValidationError';
    this.path = path;
  }
}

export interface ParseDocumentOptions {
  /**
   * Reject properties that are not in the contract (catches typos in fixtures).
   * Keep it off for API responses so additive backend changes do not break the UI.
   */
  strict?: boolean;
}

type Json = Record<string, unknown>;

/**
 * Runtime validation of unknown JSON against the A1 Document types.
 * Returns the value typed as Document, or throws DocumentValidationError.
 * Dependency-free; mirrors src/api/documentTypes.ts — keep them in sync.
 */
export function parseDocument(value: unknown, { strict = false }: ParseDocumentOptions = {}): Document {
  const v = new Validator(strict);
  const doc = v.object(value, '$', ['id', 'title', 'version', 'created_at', 'created_by', 'last_modified', 'modules']);
  v.string(doc.id, '$.id');
  v.string(doc.title, '$.title');
  v.number(doc.version, '$.version');
  v.string(doc.created_at, '$.created_at');
  v.string(doc.created_by, '$.created_by');
  v.string(doc.last_modified, '$.last_modified');
  v.array(doc.modules, '$.modules').forEach((m, i) => v.module(m, `$.modules[${i}]`));
  return value as Document;
}

class Validator {
  private readonly strict: boolean;
  constructor(strict: boolean) {
    this.strict = strict;
  }

  module(value: unknown, path: string): Module {
    const m = this.object(value, path, ['id', 'title', 'parameters', 'owners', 'comments', 'components']);
    this.string(m.id, `${path}.id`);
    this.string(m.title, `${path}.title`);
    this.parameters(m.parameters, `${path}.parameters`);
    this.array(m.owners, `${path}.owners`).forEach((o, i) => this.string(o, `${path}.owners[${i}]`));
    this.array(m.comments, `${path}.comments`).forEach((c, i) => this.string(c, `${path}.comments[${i}]`));
    this.array(m.components, `${path}.components`).forEach((c, i) => this.component(c, `${path}.components[${i}]`));
    return value as Module;
  }

  parameters(value: unknown, path: string): ModuleParameters {
    const p = this.object(value, path, ['can_copy', 'color', 'margin', 'frame']);
    this.boolean(p.can_copy, `${path}.can_copy`);
    this.string(p.color, `${path}.color`);
    this.array(p.margin, `${path}.margin`).forEach((n, i) => this.number(n, `${path}.margin[${i}]`));
    this.frame(p.frame, `${path}.frame`);
    return value as ModuleParameters;
  }

  frame(value: unknown, path: string): ModuleFrame {
    const f = this.object(value, path, ['visible', 'color', 'type', 'width', 'rounded']);
    this.boolean(f.visible, `${path}.visible`);
    this.string(f.color, `${path}.color`);
    this.oneOf(f.type, FRAME_TYPES, `${path}.type`);
    this.string(f.width, `${path}.width`);
    this.string(f.rounded, `${path}.rounded`);
    return value as ModuleFrame;
  }

  component(value: unknown, path: string): Component {
    const c = this.object(value, path, ['type', 'params']);
    const type = this.oneOf(c.type, COMPONENT_TYPES, `${path}.type`);
    const paramKeys = type === 'true_false'
      ? ['color', 'editable', 'content', 'answer']
      : ['color', 'editable', 'content'];
    const p = this.object(c.params, `${path}.params`, paramKeys);
    this.string(p.color, `${path}.params.color`);
    this.boolean(p.editable, `${path}.params.editable`);
    this.string(p.content, `${path}.params.content`);
    if (type === 'true_false') this.boolean(p.answer, `${path}.params.answer`);
    return value as Component;
  }

  // ---- primitives ----------------------------------------------------------

  object(value: unknown, path: string, keys: readonly string[]): Json {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new DocumentValidationError(path, `expected object, got ${describe(value)}`);
    }
    if (this.strict) {
      const extra = Object.keys(value).find((key) => !keys.includes(key));
      if (extra) throw new DocumentValidationError(`${path}.${extra}`, 'unknown property');
    }
    return value as Json;
  }

  array(value: unknown, path: string): unknown[] {
    if (!Array.isArray(value)) throw new DocumentValidationError(path, `expected array, got ${describe(value)}`);
    return value;
  }

  string(value: unknown, path: string): string {
    if (typeof value !== 'string') throw new DocumentValidationError(path, `expected string, got ${describe(value)}`);
    return value;
  }

  number(value: unknown, path: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new DocumentValidationError(path, `expected number, got ${describe(value)}`);
    }
    return value;
  }

  boolean(value: unknown, path: string): boolean {
    if (typeof value !== 'boolean') throw new DocumentValidationError(path, `expected boolean, got ${describe(value)}`);
    return value;
  }

  oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
    if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
      throw new DocumentValidationError(path, `${describe(value)} is not one of ${allowed.join(' | ')}`);
    }
    return value as T;
  }
}

function describe(value: unknown): string {
  if (value === undefined) return 'undefined (missing)';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value === 'string' ? JSON.stringify(value) : typeof value;
}
