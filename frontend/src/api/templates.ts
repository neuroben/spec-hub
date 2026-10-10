import type { Document, Module } from './documentTypes';
import { api } from './client';

export interface DocumentTemplateSummary {
  id: string;
  version: number;
  title: string;
  created_at: string;
  created_by: string;
  last_modified: string;
}

const userId = import.meta.env.VITE_USER_ID?.trim() ?? '';

function userQuery(): string {
  if (!userId) throw new Error('Hiányzik a VITE_USER_ID beállítás. Add meg a frontend .env fájljában.');
  return `userId=${encodeURIComponent(userId)}`;
}

function normalizeTemplate(value: unknown): Document {
  if (!value || typeof value !== 'object') throw new Error('A backend érvénytelen sablonválaszt adott.');
  const raw = value as Record<string, unknown>;
  const get = (snake: string, camel: string) => raw[snake] ?? raw[camel];
  const modulesValue = raw.modules;
  if (!Array.isArray(modulesValue)) throw new Error('A sablon válaszából hiányzik a modules lista.');
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    version: Number(raw.version ?? 1),
    created_at: String(get('created_at', 'createdAt') ?? ''),
    created_by: String(get('created_by', 'createdBy') ?? ''),
    last_modified: String(get('last_modified', 'lastModified') ?? ''),
    modules: modulesValue.map(normalizeModule),
  };
}

/** Templates do not carry persistent module IDs in the current backend DTO. The editor needs
 * a unique local key for each module; it is not written back as template data. */
function normalizeModule(value: unknown): Module {
  if (!value || typeof value !== 'object') throw new Error('A sablon érvénytelen modult tartalmaz.');
  const raw = value as Record<string, unknown>;
  const serverId = raw.id ?? raw.module_id ?? raw.moduleId;
  const id = typeof serverId === 'string' && serverId ? serverId : crypto.randomUUID();
  return {
    id,
    title: String(raw.title ?? ''),
    parameters: raw.parameters as Module['parameters'],
    owners: Array.isArray(raw.owners) ? raw.owners as string[] : [],
    comments: Array.isArray(raw.comments) ? raw.comments as string[] : [],
    components: Array.isArray(raw.components) ? raw.components as Module['components'] : [],
  };
}

function normalizeSummary(value: unknown): DocumentTemplateSummary {
  if (!value || typeof value !== 'object') throw new Error('A backend érvénytelen sablonlistát adott.');
  const raw = value as Record<string, unknown>;
  const get = (snake: string, camel: string) => raw[snake] ?? raw[camel];
  return {
    id: String(raw.id ?? ''),
    version: Number(raw.version ?? 1),
    title: String(raw.title ?? ''),
    created_at: String(get('created_at', 'createdAt') ?? ''),
    created_by: String(get('created_by', 'createdBy') ?? ''),
    last_modified: String(get('last_modified', 'lastModified') ?? ''),
  };
}

export const templatesApi = {
  async list(): Promise<DocumentTemplateSummary[]> {
    const values = await api.request<unknown[]>(`/api/template?${userQuery()}`);
    return values.map(normalizeSummary);
  },
  async get(id: string): Promise<Document> {
    return normalizeTemplate(await api.request<unknown>(`/api/template/${encodeURIComponent(id)}`));
  },
  async create(document: Document): Promise<Document> {
    const value = await api.request<unknown>(`/api/template?${userQuery()}`, {
      method: 'POST',
      body: JSON.stringify({ title: document.title, modules: document.modules }),
    });
    return normalizeTemplate(value);
  },
  async update(document: Document): Promise<Document> {
    const value = await api.request<unknown>(`/api/template?${userQuery()}`, {
      method: 'PUT',
      body: JSON.stringify({ id: document.id, title: document.title, modules: document.modules }),
    });
    return normalizeTemplate(value);
  },
  remove: (id: string): Promise<void> => api.request<void>(`/api/template/${encodeURIComponent(id)}?${userQuery()}`, { method: 'DELETE' }),
};
