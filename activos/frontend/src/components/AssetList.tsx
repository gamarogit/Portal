import { useEffect, useState } from 'react';
import { assetService, AssetSummary } from '@services/api';
import AssetForm from './AssetForm';

export default function AssetList() {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState<AssetSummary | null>(null);
  const [tableTitle, setTableTitle] = useState('Listado de Activos');

  const fetchAssets = () => {
    setLoading(true);
    return assetService
      .list()
      .then((list) => setAssets(list))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();

    // Cargar título desde configuración
    const loadTitle = async () => {
      try {
        const config = await import('../.config/index');
        const assetListConfig = config.formConfigs?.AssetList;
        if (assetListConfig?.title) {
          setTableTitle(assetListConfig.title);
        }
      } catch (error) {
        // Silently use default title
      }
    };

    // loadTitle();
  }, []);

  const handleEdit = (asset: AssetSummary) => {
    setEditingAsset(asset);
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
  };

  const handleUpdated = () => {
    setEditingAsset(null);
    fetchAssets();
  };

  if (loading) {
    return <p>Cargando activos…</p>;
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '0.5rem', color: '#333', fontSize: '1.25rem' }}>{tableTitle}</h2>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#555' }}>{editingAsset ? 'Editar activo' : 'Crear activo'}</h3>
      <AssetForm
        onCreated={fetchAssets}
        assetToEdit={editingAsset}
        onUpdated={handleUpdated}
        onCancel={handleCancelEdit}
      />
      <hr />
      {assets.length ? (
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Activo</th>
              <th>Ubicación</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Sistema operativo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.assetType?.name ?? '—'}</td>
                <td>{asset.name}</td>
                <td>{asset.location?.name ?? 'Sin ubicación'}</td>
                <td>{asset.responsible?.name ?? 'Sin responsable'}</td>
                <td>{asset.state}</td>
                <td>{asset.operatingSystem ?? '—'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(asset)}
                    style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay activos registrados.</p>
      )}
    </div>
  );
}
