import { useEffect, useState } from 'react';
import { integrationService } from '@services/api';

type IntegrationEvent = {
  id: string;
  source: string;
  status: string;
  payload: Record<string, unknown>;
  lastAttemptedAt?: string;
  createdAt: string;
};

type Metrics = Record<string, string>;

const parseMetrics = (text: string): Metrics => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce<Metrics>((acc, line) => {
      const [metric, value] = line.split(' ');
      if (metric && value) {
        acc[metric] = value;
      }
      return acc;
    }, {});
};

export default function IntegrationsView() {
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({});

  const fetchEvents = () => {
    integrationService.list(status || undefined).then(setEvents).catch(() => setMessage('No se pudieron cargar los eventos'));
    integrationService.metrics().then((text) => setMetrics(parseMetrics(text)));
  };

  useEffect(() => {
    fetchEvents();
  }, [status]);

  const dispatchPending = async () => {
    setMessage(null);
    try {
      await integrationService.dispatch(limit);
      setMessage('Eventos pendientes despachados');
      fetchEvents();
    } catch {
      setMessage('Error al despachar eventos');
    }
  };

  const createEvent = async () => {
    try {
      await integrationService.create({
        source: 'manual.frontend',
        payload: { note: 'Evento manual desde UI' },
      });
      setMessage('Evento agregado');
      fetchEvents();
    } catch {
      setMessage('Error al crear el evento');
    }
  };

  return (
    <section>
      <header>
        <h2>Integraciones externas</h2>
        <p>Revisa eventos, manda despachos manuales y monitorea métricas de integración.</p>
      </header>
      <div className="card">
        <div className="grid">
          <label>
            Estado
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="SENT">Enviados</option>
              <option value="FAILED">Fallidos</option>
            </select>
          </label>
          <label>
            Límite
            <input type="number" min={1} value={limit} onChange={(event) => setLimit(Number(event.target.value))} />
          </label>
          <button type="button" onClick={dispatchPending}>
            Despachar pendientes
          </button>
          <button type="button" onClick={createEvent}>
            Crear evento manual
          </button>
        </div>
        {message && <p className="status">{message}</p>}
      </div>
      <article className="card">
        <div className="status-panel">
          <h3>Métricas de integración</h3>
          <div className="status-grid">
            <span>Emitidos: {metrics.activos_integration_events_emitted_total ?? '-'}</span>
            <span>Enviados: {metrics.activos_integration_events_sent_total ?? '-'}</span>
            <span>Fallidos: {metrics.activos_integration_events_failed_total ?? '-'}</span>
            <span>Latencia: {metrics.activos_integration_dispatch_duration_milliseconds ?? '-'} ms</span>
          </div>
        </div>
        <h3>Eventos registrados</h3>
        <ul className="integration-list">
          {events.map((event) => (
            <li key={event.id}>
              <div>
                <strong>{event.source}</strong> · {event.status}
              </div>
              <div className="meta">
                <span>{new Date(event.createdAt).toLocaleString()}</span>
                <span>
                  {event.lastAttemptedAt
                    ? `Último intento: ${new Date(event.lastAttemptedAt).toLocaleString()}`
                    : 'Sin intentos'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
