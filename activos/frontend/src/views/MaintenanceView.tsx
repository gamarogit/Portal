import { useState } from 'react';
import { maintenanceService } from '@services/api';

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
        <label>
          ID del activo
          <input value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })} required />
        </label>
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
          Responsable
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
