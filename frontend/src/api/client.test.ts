import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, devUserId } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('API client', () => {
  it('handles a successful delete without parsing an empty body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(api.request('/api/template/id', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('preserves custom Headers and adds the JSON content type for a body', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetch);
    await api.request('/api/template', { method: 'POST', body: '{}', headers: new Headers({ 'X-Test': 'value' }) });
    const headers = fetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('X-Test')).toBe('value');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('retains problem details and the status for failed requests', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ title: 'Access denied', detail: 'Wrong owner' }, { status: 403 })));
    await expect(api.request('/api/template')).rejects.toMatchObject({ status: 403, message: 'Access denied — Wrong owner' });
  });

  it('handles non-JSON errors and network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Proxy error', { status: 502 })));
    await expect(api.request('/api/template')).rejects.toMatchObject({ status: 502 });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.request('/api/template')).rejects.toBeInstanceOf(ApiError);
    await expect(api.request('/api/template')).rejects.toMatchObject({ status: 0 });
  });

  it('uses one user id with a legacy fallback and rejects missing configuration', () => {
    vi.stubEnv('VITE_USER_ID', ' current-user ');
    vi.stubEnv('VITE_DEV_USER_ID', 'legacy-user');
    expect(devUserId()).toBe('current-user');
    vi.stubEnv('VITE_USER_ID', ' ');
    expect(devUserId()).toBe('legacy-user');
    vi.stubEnv('VITE_DEV_USER_ID', '');
    expect(() => devUserId()).toThrow('VITE_USER_ID is not set');
  });
});
