import { useEffect, useState } from 'react';
import api from '@services/api';

interface DashboardMetrics {
  summary?: {
    totalAssets: number;
    totalValue: number;
  };
  byState?: Record<string, number>;
  byLocation?: Array<{ locationName: string; count: number }>;
  byType?: Array<{ typeName: string; count: number }>;
  alerts?: any;
}

export default function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      console.log('Dashboard data:', res.data);
      setMetrics(res.data);
    } catch (err: any) {
      console.error('Error cargando dashboard:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando métricas...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!metrics) return <div style={{ padding: '2rem' }}>No se pudieron cargar las métricas</div>;

  return (
    <div>
      <h2>📊 Dashboard Ejecutivo</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Total Activos</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{metrics.summary?.totalAssets || 0}</p>
        </div>
        <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Valor Total</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>${(metrics.summary?.totalValue || 0).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {metrics.byState && (
          <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Por Estado</h3>
            <ul>
              {Object.entries(metrics.byState).map(([state, count]) => (
                <li key={state}>{state}: {count}</li>
              ))}
            </ul>
          </div>
        )}

        {metrics.byLocation && (
          <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Por Ubicación</h3>
            <ul>
              {metrics.byLocation.map((loc) => (
                <li key={loc.locationName}>{loc.locationName}: {loc.count}</li>
              ))}
            </ul>
          </div>
        )}

        {metrics.byType && (
          <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Por Tipo</h3>
            <ul>
              {metrics.byType.map((type) => (
                <li key={type.typeName}>{type.typeName}: {type.count}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
