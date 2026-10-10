import { afterEach, describe, expect, it, vi } from 'vitest';
import { exampleDocument } from './documentTypes.example';
import { createEditorStore } from '../editor/state/editorStore';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('template API integration', () => {
  it('loads backend modules without ids into separate editor entries', async () => {
    const { templatesApi } = await import('./templates');
    const { id: _id, ...module } = exampleDocument.modules[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ...exampleDocument, modules: [module, module] })));
    const document = await templatesApi.get(exampleDocument.id);
    const store = createEditorStore({ initialDocument: document });
    expect(new Set(store.getState().order).size).toBe(2);
    expect(Object.keys(store.getState().saved)).toHaveLength(2);
    expect(store.getState().toDocument().modules).toHaveLength(2);
  });

  it('creates and updates with the current Document contract and configured user id', async () => {
    vi.stubEnv('VITE_USER_ID', 'owner');
    const { templatesApi } = await import('./templates');
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(Response.json(exampleDocument)));
    vi.stubGlobal('fetch', fetch);
    const store = createEditorStore({ initialDocument: exampleDocument });
    const payload = store.getState().toDocument();
    await templatesApi.create(payload);
    await templatesApi.update(payload);
    expect(fetch.mock.calls.map(([url, init]) => [url, init.method])).toEqual([
      ['/api/template?userId=owner', 'POST'], ['/api/template?userId=owner', 'PUT'],
    ]);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ title: payload.title, modules: payload.modules });
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ id: payload.id, title: payload.title, modules: payload.modules });
  });
});
