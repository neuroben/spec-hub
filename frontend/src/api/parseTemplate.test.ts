import { describe, expect, it } from 'vitest';
import { DocumentValidationError } from './parseDocument';
import { parseTemplateDetails } from './parseTemplate';

/** Shape of GET /api/Template/{id} (DocumentTemplateDetailsDto serialized). */
const backendDetails = {
  Id: '3f6c2a1e-8b4d-4e7a-9c21-5d0b7e9a1f42',
  Version: 3,
  Title: 'Title of Document',
  created_at: '2026-09-18T09:30:00+02:00',
  created_by: 'Gyurka Hurka',
  last_modified: '2026-09-21T14:05:00+02:00',
  Modules: [
    {
      Title: 'Module with frame 1',
      Parameters: {
        can_copy: true,
        Color: '',
        Margin: [1, 2],
        Frame: { Visible: true, Color: '#55c9a8', Type: 'Dashed', Width: '1px', Rounded: '4px' },
      },
      Owners: [],
      Comments: [],
      Components: [
        { type: 'title', params: { Color: '', Editable: true, Content: 'We value your privacy' } },
        {
          type: 'true_false',
          params: { Color: '', Editable: true, Content: 'Is there an IBO problem?', Answer: false },
        },
      ],
    },
  ],
};

describe('parseTemplateDetails', () => {
  it('normalizes PascalCase keys and assigns fresh module ids', () => {
    const doc = parseTemplateDetails(structuredClone(backendDetails), () => 'fresh-module-id');

    expect(doc.id).toBe('3f6c2a1e-8b4d-4e7a-9c21-5d0b7e9a1f42');
    expect(doc.version).toBe(3);
    expect(doc.title).toBe('Title of Document');
    expect(doc.modules).toHaveLength(1);
    expect(doc.modules[0].id).toBe('fresh-module-id');
    expect(doc.modules[0].parameters).toEqual({
      can_copy: true,
      color: '',
      margin: [1, 2],
      frame: { visible: true, color: '#55c9a8', type: 'Dashed', width: '1px', rounded: '4px' },
    });
    expect(doc.modules[0].components[1]).toEqual({
      type: 'true_false',
      params: { color: '', editable: true, content: 'Is there an IBO problem?', answer: false },
    });
  });

  it('rejects responses missing required fields', () => {
    const { Title: _omitted, ...withoutTitle } = backendDetails;
    expect(() => parseTemplateDetails(withoutTitle, () => 'x')).toThrow(DocumentValidationError);
  });

  it('rejects non-object responses', () => {
    expect(() => parseTemplateDetails(null, () => 'x')).toThrow(DocumentValidationError);
  });
});
