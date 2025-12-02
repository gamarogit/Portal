import { useState, useEffect } from 'react';
import { roleService, Role } from '@services/api';

type Props = {
  onCreated: () => void;
  roleToEdit?: Role | null;
  onUpdated?: () => void;
  onCancel?: () => void;
};

import { useTheme } from '@contexts/ThemeContext';

export default function RoleForm({ onCreated, roleToEdit, onUpdated, onCancel }: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleToEdit) {
      setForm({
        name: roleToEdit.name || '',
        description: roleToEdit.description || '',
      });
    } else {
      setForm({
        name: '',
        description: '',
      });
    }
  }, [roleToEdit]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setStatus('El nombre del rol es obligatorio');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };

      if (roleToEdit) {
        await roleService.update(roleToEdit.id, payload);
        setStatus('✓ Rol actualizado correctamente');
        if (onUpdated) {
          onUpdated();
        }
      } else {
        await roleService.create(payload);
        setStatus('✓ Rol creado correctamente');
        setForm({ name: '', description: '' });
        onCreated();
      }
    } catch (error: unknown) {
      let message = 'Error al procesar el rol';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="asset-form">
      <h3>{roleToEdit ? 'Editar rol' : 'Crear nuevo rol'}</h3>

      <fieldset>
        <legend>📋 Información del rol</legend>
        <div className="asset-form-grid">
          <label>
            Nombre del rol <span className="required">*</span>
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Gerente, Analista, Desarrollador"
              required
            />
          </label>
          <label>
            Descripción
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción opcional del rol"
              rows={3}
            />
          </label>
        </div>
      </fieldset>

      <p className="helper" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
        💡 Tip: Los roles se asignan a los usuarios para identificar su puesto en la empresa.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
        >
          {loading ? 'Procesando…' : roleToEdit ? 'Actualizar' : 'Crear'}
        </button>
        {roleToEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="ghost"
            style={{
              color: theme?.primaryColor || '#2563eb',
              borderColor: theme?.primaryColor || '#cbd5f5'
            }}
          >
            Cancelar
          </button>
        )}
      </div>
      {status && <p className="status">{status}</p>}
    </form>
  );
}
