const API_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { detail?: string; title?: string } | null;
    throw new ApiError(body?.detail ?? body?.title ?? `API hiba (${res.status}): ${path}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
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
  health: () => get<HealthStatus>('/api/health'),
  weather: () => get<WeatherForecast[]>('/api/weatherforecast'),
  request,
};
