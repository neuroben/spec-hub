import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { exampleDocument } from '../api/documentTypes.example';
import type { Document } from '../api/documentTypes';
import { createEditorStore, type EditorStore } from '../editor/state/editorStore';
import type { EditorMode } from '../editor/editorMode';
import { TemplateEditorPage } from './TemplateEditorPage';

const mocks = vi.hoisted(() => ({
  store: null as unknown as EditorStore,
  canvas: null as unknown as { onSave: () => Promise<void>; saveDisabledReason?: string },
  update: vi.fn(), create: vi.fn(), navigate: vi.fn(),
  pathname: '/templates/new',
  message: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock('antd', () => ({ App: { useApp: () => ({ message: mocks.message }) } }));
vi.mock('react-router', () => ({ useNavigate: () => mocks.navigate, useLocation: () => ({ pathname: mocks.pathname }) }));
vi.mock('../api/templates', () => ({ templatesApi: { update: mocks.update, create: mocks.create } }));
vi.mock('../api/documents', () => ({ documentsApi: { update: mocks.update, create: mocks.create } }));
vi.mock('../editor/state', () => ({
  EditorStoreProvider: ({ children }: { children: ReactNode }) => children,
  useEditorStoreApi: () => mocks.store,
  useEditorStore: (selector: (state: ReturnType<EditorStore['getState']>) => unknown) => selector(mocks.store.getState()),
}));
vi.mock('../editor/panels/CanvasPanel', () => ({ CanvasPanel: (props: typeof mocks.canvas) => { mocks.canvas = props; return null; } }));
vi.mock('../editor/panels/InspectorPanel', () => ({ InspectorPanel: () => null }));
vi.mock('../editor/panels/LeftPanel', () => ({ LeftPanel: () => null }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.pathname = '/templates/existing-document/edit';
  mocks.store = createEditorStore({ initialDocument: { ...structuredClone(exampleDocument), id: 'existing-document' } });
});

function render(mode: EditorMode) {
  renderToStaticMarkup(<TemplateEditorPage mode={mode} />);
}

describe.each(['template', 'document'] as const)('%s save flow', (mode) => {
  it('blocks drafts in the UI and in the save handler', async () => {
    const id = mocks.store.getState().order[0];
    mocks.store.getState().updateModuleDraft(id, { title: 'Draft' });
    render(mode);
    expect(mocks.canvas.saveDisabledReason).toContain('module changes');
    await mocks.canvas.onSave();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.store.getState().drafts[id].title).toBe('Draft');
  });

  it('rechecks drafts when a previously enabled save handler is called', async () => {
    render(mode);
    const id = mocks.store.getState().order[0];
    mocks.store.getState().updateModuleDraft(id, { title: 'Just edited' });
    await mocks.canvas.onSave();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.store.getState().drafts[id].title).toBe('Just edited');
  });

  it('preserves drafts and committed edits made while awaiting the server', async () => {
    let resolve!: (document: Document) => void;
    mocks.update.mockImplementationOnce(() => new Promise<Document>((done) => { resolve = done; }));
    render(mode);
    const pending = mocks.canvas.onSave();
    const id = mocks.store.getState().order[0];
    mocks.store.getState().updateModuleDraft(id, { title: 'Later commit' });
    mocks.store.getState().commitModule(id);
    mocks.store.getState().updateModuleDraft(id, { title: 'Later draft' });
    mocks.store.getState().updateMeta({ title: 'Later document title' });
    resolve({ ...exampleDocument, id: 'existing-document', version: 9 });
    await pending;
    expect(mocks.store.getState().saved[id].title).toBe('Later commit');
    expect(mocks.store.getState().drafts[id].title).toBe('Later draft');
    expect(mocks.store.getState().meta).toMatchObject({ title: 'Later document title', version: 9 });
    expect(mocks.store.getState().dirty).toBe(true);
  });

  it('leaves edits intact on failure and permits retry', async () => {
    mocks.update.mockRejectedValueOnce(new Error('Backend unavailable')).mockResolvedValueOnce({ ...exampleDocument, id: 'existing-document' });
    mocks.store.getState().updateMeta({ title: 'Save me' });
    render(mode);
    await mocks.canvas.onSave();
    expect(mocks.store.getState().meta.title).toBe('Save me');
    expect(mocks.store.getState().dirty).toBe(true);
    await mocks.canvas.onSave();
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(mocks.store.getState().dirty).toBe(false);
  });
});

it('does not navigate away from edits made during template creation or submit twice', async () => {
  mocks.pathname = '/templates/new';
  mocks.store = createEditorStore();
  mocks.store.getState().addModule('New module');
  let resolve!: (document: Document) => void;
  mocks.create.mockImplementationOnce(() => new Promise<Document>((done) => { resolve = done; }));
  render('template');
  const pending = mocks.canvas.onSave();
  await mocks.canvas.onSave();
  expect(mocks.create).toHaveBeenCalledTimes(1);
  const id = mocks.store.getState().order[0];
  mocks.store.getState().updateModuleDraft(id, { title: 'New draft' });
  const saved = { ...exampleDocument, id: 'created-template' };
  resolve(saved);
  await pending;
  expect(mocks.navigate).not.toHaveBeenCalled();
  expect(mocks.store.getState().meta.id).toBe(saved.id);
  expect(mocks.store.getState().drafts[id].title).toBe('New draft');
  mocks.store.getState().commitModule(id);
  mocks.update.mockResolvedValueOnce(saved);
  await mocks.canvas.onSave();
  expect(mocks.navigate).toHaveBeenCalledWith('/templates/created-template/edit', { replace: true });
});
