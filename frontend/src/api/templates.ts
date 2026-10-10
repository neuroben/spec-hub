import type { Document } from './documentTypes';
import { api, devUserId } from './client';
import { parseTemplateDetails } from './parseTemplate';
import type { CreateTemplatePayload, UpdateTemplatePayload } from './templatePayload';

export interface DocumentTemplateSummary {
  id: string;
  version: number;
  title: string;
  created_at: string;
  created_by: string;
  last_modified: string;
}

function userQuery(): string {
  return `userId=${encodeURIComponent(devUserId())}`;
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
    return parseTemplateDetails(await api.templates.get(id), () => crypto.randomUUID());
  },
  async create(payload: CreateTemplatePayload): Promise<Document> {
    return parseTemplateDetails(await api.templates.create(payload, devUserId()), () => crypto.randomUUID());
  },
  async update(payload: UpdateTemplatePayload): Promise<Document> {
    return parseTemplateDetails(await api.templates.update(payload, devUserId()), () => crypto.randomUUID());
  },
  remove: (id: string): Promise<void> => api.request<void>(`/api/template/${encodeURIComponent(id)}?${userQuery()}`, { method: 'DELETE' }),
};
