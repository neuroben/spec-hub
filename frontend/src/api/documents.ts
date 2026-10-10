import type { Document, Module } from './documentTypes';
import { api } from './client';

export interface DocumentSummary {
  id: string;
  version: number;
  title: string;
  created_at: string;
  created_by: string;
  last_modified: string;
}

export interface CreateDocumentRequest {
  title: string;
  modules: Module[];
}

const userId = import.meta.env.VITE_USER_ID?.trim() ?? '';

function userQuery(): string {
  if (!userId) throw new Error('Hiányzik a VITE_USER_ID beállítás. Add meg a frontend .env fájljában.');
  return `userId=${encodeURIComponent(userId)}`;
}

function normalizeDocument(value: unknown): Document {
  if (!value || typeof value !== 'object') throw new Error('A backend érvénytelen dokumentumválaszt adott.');
  const raw = value as Record<string, unknown>;
  const get = (snake: string, camel: string) => raw[snake] ?? raw[camel];
  if (!Array.isArray(raw.modules)) throw new Error('A dokumentum válaszából hiányzik a modules lista.');

  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    version: Number(raw.version ?? 1),
    created_at: String(get('created_at', 'createdAt') ?? ''),
    created_by: String(get('created_by', 'createdBy') ?? ''),
    last_modified: String(get('last_modified', 'lastModified') ?? ''),
    modules: raw.modules.map(normalizeModule),
  };
}

function normalizeModule(value: unknown): Module {
  if (!value || typeof value !== 'object') throw new Error('A dokumentum érvénytelen modult tartalmaz.');
  const raw = value as Record<string, unknown>;
  const moduleId = raw.module_id ?? raw.moduleId ?? raw.id;
  return {
    id: String(moduleId ?? ''),
    title: String(raw.title ?? ''),
    parameters: raw.parameters as Module['parameters'],
    owners: Array.isArray(raw.owners) ? raw.owners as string[] : [],
    comments: Array.isArray(raw.comments) ? raw.comments as string[] : [],
    components: Array.isArray(raw.components) ? raw.components as Module['components'] : [],
  } as Module;
}

function normalizeSummary(value: unknown): DocumentSummary {
  if (!value || typeof value !== 'object') throw new Error('A backend érvénytelen dokumentumlistát adott.');
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

function createPayload(document: CreateDocumentRequest) {
  return {
    title: document.title,
    modules: document.modules.map((module) => ({
      title: module.title,
      parameters: module.parameters,
      owners: module.owners,
      // Comments are always initialized empty when a document is made from a template.
      comments: [],
      components: module.components,
    })),
  };
}

function updatePayload(document: Document) {
  return {
    id: document.id,
    title: document.title,
    modules: document.modules.map(({ id, ...module }) => ({
      ...module,
      module_id: id,
    })),
  };
}

export const documentsApi = {
  async list(): Promise<DocumentSummary[]> {
    const values = await api.request<unknown[]>(`/api/Documents?${userQuery()}`);
    return values.map(normalizeSummary);
  },

  async get(id: string): Promise<Document> {
    const value = await api.request<unknown>(`/api/Documents/${encodeURIComponent(id)}`);
    return normalizeDocument(value);
  },

  async create(document: CreateDocumentRequest, templateId: string, templateVersion: number): Promise<Document> {
    const query = `${userQuery()}&templateId=${encodeURIComponent(templateId)}&templateVersion=${encodeURIComponent(String(templateVersion))}`;
    const value = await api.request<unknown>(`/api/Documents?${query}`, {
      method: 'POST',
      body: JSON.stringify(createPayload(document)),
    });
    return normalizeDocument(value);
  },

  async update(document: Document): Promise<Document> {
    const value = await api.request<unknown>(`/api/Documents?${userQuery()}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload(document)),
    });
    return normalizeDocument(value);
  },

  remove: (id: string): Promise<void> =>
    api.request<void>(`/api/Documents/${encodeURIComponent(id)}?${userQuery()}`, { method: 'DELETE' }),
};
