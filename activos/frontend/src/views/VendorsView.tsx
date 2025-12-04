import { useEffect, useState } from 'react';
import api from '@services/api';

interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  rating?: number;
  notes?: string;
}

export default function VendorsView() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    rating: 5,
    notes: '',
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await api.get('/vendors');
      console.log('Vendors response:', res.data);
      const vendorsData = res.data.vendors || res.data || [];
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
    } catch (err: any) {
      console.error('Error cargando proveedores:', err);
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vendors', {
        name: formData.name,
        contactPerson: formData.contactPerson || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        rating: formData.rating || undefined,
        notes: formData.notes || undefined,
      });
      setShowForm(false);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', website: '', rating: 5, notes: '' });
      loadVendors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creando proveedor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      loadVendors();
    } catch (err) {
      alert('Error eliminando proveedor');
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return '-';
    return '⭐'.repeat(rating);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando proveedores...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🏢 Gestión de Proveedores</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '➕ Nuevo Proveedor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Persona de Contacto</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label>Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label>Sitio Web</label>
              <input
                type="url"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div>
              <label>Calificación (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Notas</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>Crear Proveedor</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Sitio Web</th>
            <th>Calificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(vendor => (
            <tr key={vendor.id}>
              <td><strong>{vendor.name}</strong></td>
              <td>{vendor.contactPerson || '-'}</td>
              <td>{vendor.email || '-'}</td>
              <td>{vendor.phone || '-'}</td>
              <td>
                {vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                    {vendor.website}
                  </a>
                ) : '-'}
              </td>
              <td>{renderStars(vendor.rating)}</td>
              <td>
                <button onClick={() => handleDelete(vendor.id)} style={{ background: '#dc3545' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vendors.length === 0 && <p>No hay proveedores registrados.</p>}
    </div>
  );
}
