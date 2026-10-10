import { describe, expect, it } from 'vitest';
import { createEditorStore } from '../editor/state/editorStore';
import { toCreateTemplatePayload, toUpdateTemplatePayload } from '../editor/state/serialize';
import { exampleDocument } from './documentTypes.example';
import { validateTemplatePayload, type CreateTemplatePayload } from './templatePayload';

function payloadFromFixture(): CreateTemplatePayload {
  let counter = 0;
  const store = createEditorStore({
    createId: () => `test-id-${++counter}`,
    initialDocument: exampleDocument,
  });
  return toCreateTemplatePayload(store.getState());
}

describe('toCreateTemplatePayload', () => {
  it('mirrors the backend DTO shape (Title/Modules, empty owners/comments, no module id)', () => {
    const payload = payloadFromFixture();

    expect(payload.Title).toBe('Title of Document');
    expect(payload.Modules).toHaveLength(1);

    const module = payload.Modules[0];
    expect(module).not.toHaveProperty('id');
    expect(module).not.toHaveProperty('module_id');
    expect(module.Owners).toEqual([]);
    expect(module.Comments).toEqual([]);
    expect(module.Title).toBe('Ez egy modul');
    expect(module.Parameters).toEqual({
      can_copy: true,
      Color: '',
      Margin: [1, 2],
      Frame: { Visible: false, Color: 'red', Type: 'Dotted', Width: '5px', Rounded: '5px' },
    });
  });

  it('keeps canvas order and strips client-side component keys', () => {
    const payload = payloadFromFixture();
    const types = payload.Modules[0].Components.map((c) => c.type);
    expect(types).toEqual(['title', 'paragraph', 'true_false', 'true_false']);

    for (const component of payload.Modules[0].Components) {
      expect(component).not.toHaveProperty('key');
      expect(Object.keys(component.params).sort()).toEqual(
        component.type === 'true_false'
          ? ['Answer', 'Color', 'Content', 'Editable']
          : ['Color', 'Content', 'Editable'],
      );
    }
  });

  it('update payload carries the document id; the server owns the version', () => {
    let counter = 0;
    const store = createEditorStore({
      createId: () => `test-id-${++counter}`,
      initialDocument: exampleDocument,
    });
    const payload = toUpdateTemplatePayload(store.getState());
    expect(payload.Id).toBe('');
    expect(payload).not.toHaveProperty('version');
  });
});

describe('validateTemplatePayload', () => {
  it('accepts the fixture payload', () => {
    expect(validateTemplatePayload(payloadFromFixture())).toEqual([]);
  });

  it('reports empty document and module titles', () => {
    const payload = payloadFromFixture();
    const invalid = {
      ...payload,
      Title: '  ',
      Modules: [{ ...payload.Modules[0], Title: '' }],
    };
    expect(validateTemplatePayload(invalid)).toEqual([
      'Document title is required.',
      'Module 1: title is required.',
    ]);
  });

  it('reports bad margin length and unknown component types', () => {
    const payload = payloadFromFixture();
    const invalid = {
      ...payload,
      Modules: [
        {
          ...payload.Modules[0],
          Parameters: { ...payload.Modules[0].Parameters, Margin: [1, 2, 3] },
          Components: [{ type: 'table', params: { Editable: false, Color: '', Content: '' } }],
        },
      ],
    };
    expect(validateTemplatePayload(invalid as unknown as CreateTemplatePayload)).toEqual([
      'Module "Ez egy modul": margin must have exactly 2 numbers.',
      'Module "Ez egy modul", component 1: unknown type "table".',
    ]);
  });
});
