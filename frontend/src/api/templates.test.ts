import { afterEach, describe, expect, it, vi } from 'vitest';
import { exampleDocument } from './documentTypes.example';
import { templatesApi } from './templates';
import { createEditorStore } from '../editor/state/editorStore';
import { toCreateTemplatePayload } from '../editor/state/serialize';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('template API integration', () => {
  it('loads backend modules without ids into separate editor entries', async () => {
    const { id: _id, ...module } = exampleDocument.modules[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ...exampleDocument, modules: [module, module] })));
    const document = await templatesApi.get(exampleDocument.id);
    const store = createEditorStore({ initialDocument: document });
    expect(new Set(store.getState().order).size).toBe(2);
    expect(Object.keys(store.getState().saved)).toHaveLength(2);
    expect(store.getState().toDocument().modules).toHaveLength(2);
  });

  it('creates and updates with the validated wire payload and shared user id', async () => {
    vi.stubEnv('VITE_USER_ID', 'owner');
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(Response.json(exampleDocument)));
    vi.stubGlobal('fetch', fetch);
    const store = createEditorStore({ initialDocument: exampleDocument });
    const payload = toCreateTemplatePayload(store.getState());
    await templatesApi.create(payload);
    await templatesApi.update({ ...payload, Id: exampleDocument.id });
    expect(fetch.mock.calls.map(([url, init]) => [url, init.method])).toEqual([
      ['/api/Template?userId=owner', 'POST'], ['/api/Template?userId=owner', 'PUT'],
    ]);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(payload);
    expect(payload.Modules[0]).toMatchObject({ Owners: [], Comments: [] });
    expect(payload.Modules[0]).not.toHaveProperty('id');
  });
});
