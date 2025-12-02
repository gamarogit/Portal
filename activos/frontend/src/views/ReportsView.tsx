import { useEffect, useState } from 'react';
import { auditService, reportService } from '@services/api';
import api from '@services/api';

interface Asset {
  id: string;
  code?: string;
  name: string;
  assetType: { name: string };
  state: string;
}

export default function ReportsView() {
  const [inventory, setInventory] = useState([]);
  const [depreciation, setDepreciation] = useState([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState('');
  const [audits, setAudits] = useState([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [invData, depData, assetsRes] = await Promise.all([
          reportService.inventory(),
          reportService.depreciation(),
          api.get('/assets'),
        ]);
        setInventory(invData);
        setDepreciation(depData);
        // El endpoint devuelve { data: [], pagination: {} }
        const assetsData = assetsRes.data.data || assetsRes.data || [];
        console.log('Assets cargados:', assetsData);
        // Filtrar solo activos vigentes (ACTIVO)
        const activeAssets = Array.isArray(assetsData) 
          ? assetsData.filter((a: Asset) => a.state === 'ACTIVO')
          : [];
        console.log('Activos ACTIVO:', activeAssets);
        setAssets(activeAssets);
        setLoadError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cargar reportes';
        setLoadError(message);
        console.error('Error loading reports:', error);
      }
    };
    loadReports();
  }, []);

  const fetchAudits = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assetId) {
      setAuditError('Ingresa un ID de activo');
      return;
    }
    setAuditError(null);
    try {
      const data = await auditService.byAsset(assetId);
      setAudits(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible recuperar las auditorías';
      setAuditError(message);
      console.error('Error fetching audits:', error);
    }
  };

  return (
    <section>
      <header>
        <h2>Reportes</h2>
        <p>Visualiza métricas de inventario, depreciación y auditorías por activo.</p>
      </header>
      
      {loadError && (
        <div className="status error" style={{ marginBottom: '1rem' }}>
          ⚠️ {loadError}
        </div>
      )}
      
      <div className="grid">
        <article className="card">
          <h3>Inventario por estado</h3>
          <ul>
            {inventory.map((item: any) => (
              <li key={item.state}>
                {item.state}: {item._count?.state ?? 0}
              </li>
            ))}
            {!inventory.length && !loadError && <li>No hay datos.</li>}
          </ul>
        </article>
        <article className="card">
          <h3>Depreciación por método</h3>
          <ul>
            {depreciation.map((item: any) => (
              <li key={item.method}>
                {item.method}: {item._sum?.amount ?? 0}
              </li>
            ))}
            {!depreciation.length && !loadError && <li>No hay datos.</li>}
          </ul>
        </article>
      </div>

      <article className="card">
        <h3>Auditorías por activo</h3>
        <form className="audit-form" onSubmit={fetchAudits}>
          <select
            value={assetId}
            onChange={(event) => setAssetId(event.target.value)}
            style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="">Selecciona un activo...</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.code ? `${asset.code} - ` : ''}{asset.name} ({asset.assetType.name})
              </option>
            ))}
          </select>
          <button type="submit" disabled={!assetId}>Consultar</button>
        </form>
        {auditError && <p className="status error">{auditError}</p>}
        <ul>
          {audits.map((audit: any) => (
            <li key={audit.id}>
              <strong>{audit.action}</strong> · {new Date(audit.occurredAt).toLocaleString()}
            </li>
          ))}
          {!audits.length && <li>No hay registros.</li>}
        </ul>
      </article>
    </section>
  );
}
