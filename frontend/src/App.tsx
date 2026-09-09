import { useEffect, useState } from 'react';
import { api, type HealthStatus, type WeatherForecast } from './api/client';
import './App.css';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
    api
      .weather()
      .then(setForecast)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>SpecHub</h1>
      <p>React + .NET + PostgreSQL váz.</p>

      {error && <p style={{ color: 'red' }}>Backend nem elérhető: {error}</p>}

      <section>
        <h2>Backend health</h2>
        <pre>{health ? JSON.stringify(health, null, 2) : 'betöltés…'}</pre>
      </section>

      <section>
        <h2>WeatherForecast (példa API)</h2>
        <ul>
          {forecast.map((f) => (
            <li key={f.date}>
              {f.date}: {f.temperatureC}°C / {f.temperatureF}°F – {f.summary}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
