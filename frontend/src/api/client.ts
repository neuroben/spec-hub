import type { CreateTemplatePayload, UpdateTemplatePayload } from './templatePayload';

const API_URL = import.meta.env.VITE_API_URL ?? '';

/** userId until auth lands: dev constant from the environment (see .env.example). */
export function devUserId(): string {
  const userId = import.meta.env.VITE_USER_ID?.trim() || import.meta.env.VITE_DEV_USER_ID?.trim();
  if (!userId) {
    throw new Error('VITE_USER_ID is not set. Add it to frontend/.env (see .env.example).');
  }
  return userId;
}

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function toApiError(res: Response, path: string): Promise<ApiError> {
  let detail: string | undefined;
  try {
    const body = (await res.json()) as { title?: string; detail?: string };
    detail = [body.title, body.detail].filter(Boolean).join(' — ') || undefined;
  } catch {
    // Non-JSON error body (proxy HTML, empty response, …): fall back to the status text.
  }
  return new ApiError(res.status, detail ?? `API error ${res.status}: ${path}`);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(0, `Cannot reach the backend (${path}). Is it running?`);
  }
  if (!res.ok) throw await toApiError(res, path);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export interface HealthStatus {
  status: string;
  service: string;
  time: string;
}

export interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string | null;
}

export const api = {
  request,
  health: () => get<HealthStatus>('/api/health'),
  weather: () => get<WeatherForecast[]>('/api/weatherforecast'),
  templates: {
    /** Raw response; parseTemplateDetails validates and normalizes it. */
    get: (templateId: string) => get<unknown>(`/api/Template/${encodeURIComponent(templateId)}`),
    create: (payload: CreateTemplatePayload, userId: string) =>
      request<unknown>(`/api/Template?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (payload: UpdateTemplatePayload, userId: string) =>
      request<unknown>(`/api/Template?userId=${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },
};
