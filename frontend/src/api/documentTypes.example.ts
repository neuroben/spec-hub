import type { Component, Document } from './documentTypes.ts';

/**
 * Typed mirror of the root schema_plan.json.
 * `satisfies Document` proves it type-checks; scripts/check-document-schema.ts
 * proves it is identical to schema_plan.json.
 */
export const exampleDocument = {
  id: '',
  title: 'Title of Document',
  version: 1,
  created_at: '1999-01-08',
  created_by: '',
  last_modified: '',
  modules: [
    {
      id: 'UUID',
      title: 'Ez egy modul',
      parameters: {
        can_copy: true,
        color: '',
        margin: [1, 2],
        frame: {
          visible: false,
          color: 'red',
          type: 'Dotted',
          width: '5px',
          rounded: '5px',
        },
      },
      owners: ['usr.id', 'usr.id'],
      comments: ['comment.id', 'comment.id'],
      components: [
        { type: 'title', params: { color: 'black', editable: true, content: 'We value your privacy' } },
        { type: 'paragraph', params: { color: 'red', editable: true, content: 'We value your privacy' } },
        { type: 'true_false', params: { color: 'red', editable: true, content: 'Is there IBO problem?', answer: true } },
        { type: 'true_false', params: { color: 'red', editable: true, content: 'Is there IBO problem?', answer: false } },
      ],
    },
  ],
} satisfies Document;

// Compile-time guards: the old typo and a missing `answer` must not type-check.
export const rejectedComponents: Component[] = [
  // @ts-expect-error – "paraprah" typo is not a valid component type
  { type: 'paraprah', params: { color: '', editable: true, content: '' } },
  // @ts-expect-error – true_false requires `answer`
  { type: 'true_false', params: { color: '', editable: true, content: '' } },
];
