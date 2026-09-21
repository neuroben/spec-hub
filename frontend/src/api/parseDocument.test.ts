import { describe, expect, it } from 'vitest';
import sampleDocument from '../mocks/sampleDocument.json';
import { exampleDocument } from './documentTypes.example';
import { DocumentValidationError, parseDocument } from './parseDocument';
import { createInitialState, editorReducer, fromDocument, toDocument } from '../editor/state';

const clone = <T,>(value: T): T => structuredClone(value);
type Mutable = Record<string, any>;

function expectInvalid(mutate: (doc: Mutable) => void, path: string, options = { strict: true }) {
  const doc = clone(sampleDocument) as Mutable;
  mutate(doc);
  try {
    parseDocument(doc, options);
  } catch (error) {
    expect(error).toBeInstanceOf(DocumentValidationError);
    expect((error as DocumentValidationError).path).toBe(path);
    return;
  }
  throw new Error(`expected validation error at ${path}`);
}

describe('parseDocument', () => {
  it('accepts the fixture (strict) and the A1 example', () => {
    expect(parseDocument(sampleDocument, { strict: true })).toBe(sampleDocument);
    expect(parseDocument(exampleDocument, { strict: true })).toBe(exampleDocument);
  });

  it('fixture has the agreed shape', () => {
    const doc = parseDocument(sampleDocument);
    expect(doc.title).toBe('Title of Document');
    expect(doc.modules.map((m) => [m.title, m.parameters.frame.visible])).toEqual([
      ['Module with frame 1', true],
      ['Module without frame', false],
    ]);
    for (const m of doc.modules) expect(m.components.length).toBeGreaterThanOrEqual(2);
  });

  it('fixture round-trips through the editor store unchanged', () => {
    let n = 0;
    const doc = parseDocument(sampleDocument);
    const state = editorReducer(createInitialState(), { type: 'loadDocument', ...fromDocument(doc, () => `k${++n}`) });
    expect(toDocument(state)).toEqual(doc);
  });

  it('rejects the old "paraprah" typo', () => {
    expectInvalid((d) => (d.modules[0].components[1].type = 'paraprah'), '$.modules[0].components[1].type');
  });

  it('rejects true_false without answer', () => {
    expectInvalid((d) => delete d.modules[0].components[2].params.answer, '$.modules[0].components[2].params.answer');
  });

  it('rejects lowercase frame type', () => {
    expectInvalid((d) => (d.modules[0].parameters.frame.type = 'dashed'), '$.modules[0].parameters.frame.type');
  });

  it('rejects version as string', () => {
    expectInvalid((d) => (d.version = '1'), '$.version');
  });

  it('rejects a missing title', () => {
    expectInvalid((d) => delete d.title, '$.title');
  });

  it('strict mode rejects unknown properties, lenient mode allows them', () => {
    expectInvalid((d) => (d.modules[1].parameters.frame.is = false), '$.modules[1].parameters.frame.is');
    const doc = clone(sampleDocument) as Mutable;
    doc.extra = 1;
    expect(() => parseDocument(doc)).not.toThrow();
  });
});
