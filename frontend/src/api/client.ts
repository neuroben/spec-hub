const API_URL = import.meta.env.VITE_API_URL ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
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
};
