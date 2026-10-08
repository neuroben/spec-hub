import type { Module } from './documentTypes';
import { api } from './client';

export interface SavedModule {
  id: string;
  module: Module;
  saved_by: string;
  saved_at: string;
}

export const SAVED_MODULES_UPDATED_EVENT = 'spec-hub:saved-modules-updated';

const userId = import.meta.env.VITE_USER_ID?.trim() ?? '';

function userQuery(): string {
  if (!userId) throw new Error('Hiányzik a VITE_USER_ID beállítás. Add meg a frontend .env fájljában.');
  return `userId=${encodeURIComponent(userId)}`;
}

function normalizeSavedModule(value: unknown): SavedModule {
  if (!value || typeof value !== 'object') throw new Error('A backend érvénytelen mentett modult adott.');
  const raw = value as Record<string, unknown>;
  const module = raw.module;
  if (!module || typeof module !== 'object' || Array.isArray(module)) {
    throw new Error('A mentett modul válaszából hiányzik a module objektum.');
  }

  return {
    id: String(raw.id ?? ''),
    module: module as Module,
    saved_by: String(raw.saved_by ?? raw.savedBy ?? ''),
    saved_at: String(raw.saved_at ?? raw.savedAt ?? ''),
  };
}

export const savedModulesApi = {
  async list(): Promise<SavedModule[]> {
    const values = await api.request<unknown[]>(`/api/SavedModules?${userQuery()}`);
    return values.map(normalizeSavedModule);
  },

  async save(module: Module, name = module.title): Promise<SavedModule> {
    const value = await api.request<unknown>(`/api/SavedModules?${userQuery()}`, {
      method: 'POST',
      body: JSON.stringify({
        module: { ...module, title: name.trim(), owners: [], comments: [] },
      }),
    });
    return normalizeSavedModule(value);
  },

  remove(id: string): Promise<void> {
    return api.request<void>(`/api/SavedModules/${encodeURIComponent(id)}?${userQuery()}`, {
      method: 'DELETE',
    });
  },
};
