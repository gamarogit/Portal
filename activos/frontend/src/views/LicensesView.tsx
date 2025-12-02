import { useEffect, useState } from 'react';
import api from '@services/api';

interface License {
  id: string;
  name: string;
  vendor: string;
  licenseKey?: string;
  purchaseDate: string;
  expirationDate?: string;
  totalSeats: number;
  status: string;
  unitCost?: number;
  totalCost?: number;
  invoiceFolio?: string;
}

export default function LicensesView() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    licenseKey: '',
    purchaseDate: '',
    expirationDate: '',
    totalSeats: 1,
    unitCost: 0,
    totalCost: 0,
    invoiceFolio: '',
  });

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    try {
      const res = await api.get('/licenses');
      console.log('Licenses response:', res.data);
      // El backend puede devolver { data: [] } o directamente []
      const licensesData = res.data.data || res.data || [];
      setLicenses(Array.isArray(licensesData) ? licensesData : []);
    } catch (err: any) {
      console.error('Error cargando licencias:', err);
      setError(err.message || 'Error al cargar licencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost.toString()).toFixed(2) : undefined,
        totalCost: formData.totalCost ? parseFloat(formData.totalCost.toString()).toFixed(2) : undefined,
        licenseKey: formData.licenseKey || undefined,
        expirationDate: formData.expirationDate || undefined,
        invoiceFolio: formData.invoiceFolio || undefined,
      };

      if (editingId) {
        await api.put(`/licenses/${editingId}`, payload);
      } else {
        await api.post('/licenses', payload);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', vendor: '', licenseKey: '', purchaseDate: '', expirationDate: '', totalSeats: 1, unitCost: 0, totalCost: 0, invoiceFolio: '' });
      loadLicenses();
    } catch (err: any) {
      alert(err.response?.data?.message || `Error ${editingId ? 'actualizando' : 'creando'} licencia`);
    }
  };

  const handleEdit = (license: License) => {
    setEditingId(license.id);
    setFormData({
      name: license.name,
      vendor: license.vendor,
      licenseKey: license.licenseKey || '',
      purchaseDate: license.purchaseDate.split('T')[0],
      expirationDate: license.expirationDate ? license.expirationDate.split('T')[0] : '',
      totalSeats: license.totalSeats,
      unitCost: license.unitCost || 0,
      totalCost: license.totalCost || 0,
      invoiceFolio: license.invoiceFolio || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta licencia?')) return;
    try {
      await api.delete(`/licenses/${id}`);
      loadLicenses();
    } catch (err) {
      alert('Error eliminando licencia');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando licencias...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>💿 Gestión de Licencias Software</h2>
        <button onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setEditingId(null);
            setFormData({ name: '', vendor: '', licenseKey: '', purchaseDate: '', expirationDate: '', totalSeats: 1, unitCost: 0, totalCost: 0, invoiceFolio: '' });
          }
        }}>
          {showForm ? 'Cancelar' : '➕ Nueva Licencia'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Proveedor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Clave de Licencia</label>
              <input
                type="text"
                value={formData.licenseKey}
                onChange={e => setFormData({ ...formData, licenseKey: e.target.value })}
              />
            </div>
            <div>
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={formData.totalSeats}
                onChange={e => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label>Fecha de Compra</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Fecha de Expiración</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
            <div>
              <label>Costo Unitario</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={e => {
                  const unitCost = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, unitCost, totalCost: unitCost * formData.totalSeats });
                }}
              />
            </div>
            <div>
              <label>Costo Total</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalCost}
                onChange={e => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label>Folio de Factura</label>
              <input
                type="text"
                value={formData.invoiceFolio}
                onChange={e => setFormData({ ...formData, invoiceFolio: e.target.value })}
                placeholder="Opcional"
              />
            </div>
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>
            {editingId ? 'Actualizar Licencia' : 'Crear Licencia'}
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Proveedor</th>
            <th>Asientos</th>
            <th>Estado</th>
            <th>Compra</th>
            <th>Expiración</th>
            <th>Costo Unit.</th>
            <th>Costo Total</th>
            <th>Folio Factura</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {licenses.map(lic => (
            <tr key={lic.id}>
              <td>{lic.name}</td>
              <td>{lic.vendor}</td>
              <td>{lic.totalSeats}</td>
              <td>{lic.status}</td>
              <td>{new Date(lic.purchaseDate).toLocaleDateString()}</td>
              <td>{lic.expirationDate ? new Date(lic.expirationDate).toLocaleDateString() : '-'}</td>
              <td>${lic.unitCost?.toFixed(2) || '0.00'}</td>
              <td>${lic.totalCost?.toFixed(2) || '0.00'}</td>
              <td>{lic.invoiceFolio || '-'}</td>
              <td>
                <button 
                  onClick={() => handleEdit(lic)} 
                  style={{ background: '#007bff', marginRight: '0.5rem' }}
                >
                  Editar
                </button>
                <button onClick={() => handleDelete(lic.id)} style={{ background: '#dc3545' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {licenses.length === 0 && <p>No hay licencias registradas.</p>}
    </div>
  );
}
