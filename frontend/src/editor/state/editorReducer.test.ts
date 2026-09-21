import { beforeEach, describe, expect, it } from 'vitest';
import { exampleDocument } from '../../api/documentTypes.example';
import type { EditorAction } from './actions';
import { createInitialState, editorReducer } from './editorReducer';
import { createEditorStore } from './editorStore';
import { createComponent, createModule } from './factories';
import { selectModules, selectSelectedModule } from './selectors';
import { fromDocument, toDocument } from './serialize';
import type { EditorState } from './types';

const counter = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const reduce = (state: EditorState, ...actions: EditorAction[]) =>
  actions.reduce((s, a) => editorReducer(s, a), state);

/** State with two saved modules (m1, m2), clean. */
function loaded(): EditorState {
  const m1 = { ...createModule('m1', 'One'), components: [createComponent('paragraph', 'c1')] };
  const m2 = createModule('m2', 'Two');
  return reduce(createInitialState(), {
    type: 'loadDocument',
    meta: { id: 'doc', version: 1, created_at: '', created_by: '', last_modified: '' },
    modules: [m1, m2],
  });
}

describe('editorReducer', () => {
  let state: EditorState;
  beforeEach(() => {
    state = loaded();
  });

  it('loadDocument replaces everything and is clean', () => {
    expect(state.order).toEqual(['m1', 'm2']);
    expect(state.drafts).toEqual({});
    expect(state.selectedModuleId).toBeNull();
    expect(state.dirty).toBe(false);
  });

  it('addModule appends, selects and marks dirty', () => {
    const next = reduce(state, { type: 'addModule', module: createModule('m3') });
    expect(next.order).toEqual(['m1', 'm2', 'm3']);
    expect(next.selectedModuleId).toBe('m3');
    expect(next.dirty).toBe(true);
  });

  it('removeModule removes saved, draft, order and selection', () => {
    const next = reduce(
      state,
      { type: 'selectModule', moduleId: 'm1' },
      { type: 'updateModuleDraft', moduleId: 'm1', patch: { title: 'x' } },
      { type: 'removeModule', moduleId: 'm1' },
    );
    expect(next.order).toEqual(['m2']);
    expect(next.saved.m1).toBeUndefined();
    expect(next.drafts.m1).toBeUndefined();
    expect(next.selectedModuleId).toBeNull();
    expect(next.dirty).toBe(true);
  });

  it('no-op actions return the same reference', () => {
    expect(editorReducer(state, { type: 'removeModule', moduleId: 'nope' })).toBe(state);
    expect(editorReducer(state, { type: 'selectModule', moduleId: 'nope' })).toBe(state);
    expect(editorReducer(state, { type: 'commitModule', moduleId: 'm1' })).toBe(state);
    expect(editorReducer(state, { type: 'revertModule', moduleId: 'm1' })).toBe(state);
    expect(editorReducer(state, { type: 'resetDirty' })).toBe(state);
    expect(editorReducer(state, { type: 'updateComponent', moduleId: 'm1', key: 'nope', params: {} })).toBe(state);
  });

  it('selectModule selects and clears', () => {
    const selected = reduce(state, { type: 'selectModule', moduleId: 'm2' });
    expect(selected.selectedModuleId).toBe('m2');
    expect(reduce(selected, { type: 'selectModule', moduleId: null }).selectedModuleId).toBeNull();
  });

  it('updateModuleDraft edits a draft, leaves saved untouched, deep-merges frame', () => {
    const next = reduce(state, {
      type: 'updateModuleDraft',
      moduleId: 'm1',
      patch: { title: 'Edited', parameters: { frame: { visible: true, type: 'Dashed' } } },
    });
    expect(next.saved.m1.title).toBe('One');
    expect(next.drafts.m1.title).toBe('Edited');
    expect(next.drafts.m1.parameters.frame).toEqual({
      visible: true, color: '', type: 'Dashed', width: '0px', rounded: '0px',
    });
    expect(next.drafts.m1.parameters.margin).toEqual([0, 0]);
    expect(next.dirty).toBe(false);
  });

  it('commitModule (Save) moves draft to saved and marks dirty', () => {
    const next = reduce(
      state,
      { type: 'updateModuleDraft', moduleId: 'm1', patch: { title: 'Edited' } },
      { type: 'commitModule', moduleId: 'm1' },
    );
    expect(next.saved.m1.title).toBe('Edited');
    expect(next.drafts.m1).toBeUndefined();
    expect(next.dirty).toBe(true);
  });

  it('revertModule (Cancel) restores saved state including added components', () => {
    const next = reduce(
      state,
      { type: 'updateModuleDraft', moduleId: 'm1', patch: { title: 'Edited' } },
      { type: 'addComponent', moduleId: 'm1', component: createComponent('title', 'c2') },
      { type: 'revertModule', moduleId: 'm1' },
    );
    expect(next.drafts).toEqual({});
    expect(next.saved).toBe(state.saved);
    expect(selectModules(next)[0].components.map((c) => c.key)).toEqual(['c1']);
  });

  it('addComponent adds to the draft with type-specific defaults', () => {
    const next = reduce(state, { type: 'addComponent', moduleId: 'm2', component: createComponent('true_false', 'c9') });
    expect(next.saved.m2.components).toEqual([]);
    expect(next.drafts.m2.components).toEqual([
      { key: 'c9', type: 'true_false', params: { color: '', editable: false, content: '', answer: false } },
    ]);
  });

  it('updateComponent patches known params only', () => {
    const next = reduce(state, {
      type: 'updateComponent', moduleId: 'm1', key: 'c1', params: { content: 'Hello', answer: true },
    });
    expect(next.drafts.m1.components[0]).toEqual({
      key: 'c1', type: 'paragraph', params: { color: '', editable: false, content: 'Hello' },
    });
  });

  it('removeComponent removes from the draft', () => {
    const next = reduce(state, { type: 'removeComponent', moduleId: 'm1', key: 'c1' });
    expect(next.drafts.m1.components).toEqual([]);
    expect(next.saved.m1.components).toHaveLength(1);
  });

  it('dirty lifecycle: load → false, commit → true, resetDirty → false', () => {
    const committed = reduce(
      state,
      { type: 'updateModuleDraft', moduleId: 'm2', patch: { title: 'x' } },
      { type: 'commitModule', moduleId: 'm2' },
    );
    expect(committed.dirty).toBe(true);
    expect(reduce(committed, { type: 'resetDirty' }).dirty).toBe(false);
  });
});

describe('selectors', () => {
  it('selectModules overlays drafts and is memoized', () => {
    const state = reduce(loaded(), { type: 'updateModuleDraft', moduleId: 'm2', patch: { title: 'Draft' } });
    const a = selectModules(state);
    expect(a.map((m) => m.title)).toEqual(['One', 'Draft']);
    expect(selectModules(state)).toBe(a);
  });

  it('selectSelectedModule returns the draft when present', () => {
    const state = reduce(
      loaded(),
      { type: 'selectModule', moduleId: 'm1' },
      { type: 'updateModuleDraft', moduleId: 'm1', patch: { title: 'Draft' } },
    );
    expect(selectSelectedModule(state)?.title).toBe('Draft');
  });
});

describe('serialize', () => {
  it('toDocument(fromDocument(doc)) round-trips the A1 example', () => {
    const { meta, modules } = fromDocument(exampleDocument, counter());
    const state = editorReducer(createInitialState(), { type: 'loadDocument', meta, modules });
    expect(toDocument(state)).toEqual(exampleDocument);
  });
});

describe('editorStore', () => {
  it('actions are callable outside React; toDocument excludes drafts', () => {
    const store = createEditorStore({ createId: counter() });
    const { addModule, addComponent, updateComponent, commitModule, updateModuleDraft } = store.getState();

    const moduleId = addModule('First');
    const key = addComponent(moduleId, 'title');
    expect(key).toBe('id-2');
    updateComponent(moduleId, key!, { content: 'Hi' });
    commitModule(moduleId);
    updateModuleDraft(moduleId, { title: 'Unsaved' });

    const doc = store.getState().toDocument();
    expect(doc.modules).toEqual([
      expect.objectContaining({
        id: 'id-1',
        title: 'First',
        components: [{ type: 'title', params: { color: '', editable: false, content: 'Hi' } }],
      }),
    ]);
    expect(store.getState().dirty).toBe(true);
    expect(addComponent('missing', 'title')).toBeNull();
  });
});
