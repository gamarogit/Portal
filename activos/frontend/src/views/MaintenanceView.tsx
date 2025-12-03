import { useState, useEffect } from 'react';
import { maintenanceService } from '@services/api';
import api from '@services/api';

interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  assetType?: { name: string };
  state: string;
  responsible?: { name: string; email: string };
}

const emptyForm = {
  assetId: '',
  scheduledAt: '',
  performedById: '',
  notes: '',
};

export default function MaintenanceView() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Asset Search State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAssetResponsible, setSelectedAssetResponsible] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Load assets for search
    api.get('/assets').then(res => {
      const assetsData = res.data.data || res.data || [];
      setAssets(assetsData);
      setFilteredAssets(assetsData);
    }).catch(err => {
      console.error('Error cargando activos:', err);
    });
  }, []);

  useEffect(() => {
    // Filter assets
    if (searchTerm.trim() === '') {
      setFilteredAssets(assets);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = assets.filter(asset =>
        asset.name.toLowerCase().includes(term) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(term))
      );
      setFilteredAssets(filtered);
    }
  }, [searchTerm, assets]);

  const handleSelectAsset = (asset: Asset) => {
    setForm({ ...form, assetId: asset.id });
    setSearchTerm(`${asset.name} (${asset.serialNumber || 'Sin serie'})`);
    setSelectedAssetResponsible(asset.responsible || null);
    setShowDropdown(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await maintenanceService.create({
        assetId: form.assetId,
        scheduledAt: form.scheduledAt,
        performedById: form.performedById || undefined,
        notes: form.notes || undefined,
      });
      setStatus('Mantenimiento programado');
      setForm(emptyForm);
      setSearchTerm('');
    } catch (error) {
      setStatus('Error al programar mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <header>
        <h2>Mantenimientos</h2>
        <p>Programa mantenimientos y registra el responsable.</p>
      </header>
      <form onSubmit={submit} className="card">
        <div style={{ position: 'relative' }}>
          <label>
            Activo
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                // Clear assetId if user types manually to force selection
                if (form.assetId) {
                  setForm({ ...form, assetId: '' });
                  setSelectedAssetResponsible(null);
                }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar activo..."
              required
            />
          </label>
          {showDropdown && filteredAssets.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              marginTop: '0.25rem'
            }}>
              {filteredAssets.slice(0, 10).map(asset => (
                <div
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  style={{
                    padding: '0.5rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ fontWeight: 600 }}>{asset.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Serie: {asset.serialNumber || 'N/A'} | Tipo: {asset.assetType?.name || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <label>
          Fecha programada
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            required
          />
        </label>
        <label>
          Responsable de dar el mantenimiento
          <input value={form.performedById} onChange={(e) => setForm({ ...form, performedById: e.target.value })} />
        </label>
        <label>
          Notas
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Programar mantenimiento'}
        </button>
        {status && <p className="status">{status}</p>}
      </form>
    </section>
  );
}
