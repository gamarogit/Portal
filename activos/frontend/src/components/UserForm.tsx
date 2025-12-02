import { useState, useEffect } from 'react';
import { userService, roleService, User, Role } from '@services/api';
import api from '@services/api';

type Props = {
  onCreated: () => void;
  userToEdit?: User | null;
  onUpdated?: () => void;
  onCancel?: () => void;
};

import { useTheme } from '@contexts/ThemeContext';

export default function UserForm({ onCreated, userToEdit, onUpdated, onCancel }: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    roleId: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gridColumns, setGridColumns] = useState('1fr 1fr 1fr');

  useEffect(() => {
    loadRoles();
    loadConfiguration();
  }, []);

  useEffect(() => {
    const handleConfigUpdate = () => {
      loadConfiguration();
    };
    window.addEventListener('configurationUpdated', handleConfigUpdate);
    return () => window.removeEventListener('configurationUpdated', handleConfigUpdate);
  }, []);

  useEffect(() => {
    if (userToEdit) {
      setForm({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        roleId: userToEdit.roleId || '',
      });
    } else {
      setForm({
        name: '',
        email: '',
        roleId: '',
      });
    }
  }, [userToEdit]);

  const loadConfiguration = async () => {
    try {
      const res = await api.get('/configuration/form-schema?form=UserForm');
      if (res.data.layout === 'grid-2cols') {
        setGridColumns('1fr 1fr');
      } else if (res.data.layout === 'grid-3cols') {
        setGridColumns('1fr 1fr 1fr');
      } else {
        setGridColumns('1fr');
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.list();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setStatus('El nombre y email son obligatorios');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: form.roleId || null,
      };

      if (userToEdit) {
        await userService.update(userToEdit.id, payload);
        setStatus('✓ Usuario actualizado correctamente');
        if (onUpdated) {
          onUpdated();
        }
      } else {
        await userService.create(payload);
        setStatus('✓ Usuario creado correctamente');
        setForm({ name: '', email: '', roleId: '' });
        onCreated();
      }
    } catch (error: unknown) {
      let message = 'Error al procesar el usuario';
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
      <h3>{userToEdit ? 'Editar usuario' : 'Crear nuevo usuario'}</h3>

      <fieldset>
        <legend>👤 Información del usuario</legend>
        <div style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '15px',
          alignItems: 'start'
        }}>
          <label>
            Nombre completo <span className="required">*</span>
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </label>
          <label>
            Email corporativo <span className="required">*</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ej: juan.perez@empresa.com"
              required
            />
          </label>
          <label>
            Rol en la empresa
            <select
              value={form.roleId}
              onChange={(e) => handleChange('roleId', e.target.value)}
            >
              <option value="">Sin rol asignado</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {roles.length === 0 && (
              <small style={{ color: '#999', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                No hay roles disponibles. Créalos primero en la sección de Roles.
              </small>
            )}
          </label>
        </div>
      </fieldset>

      <p className="helper" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
        💡 Tip: El rol indica el puesto o cargo del usuario en la empresa.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: theme?.primaryColor || '#2563eb' }}
        >
          {loading ? 'Procesando…' : userToEdit ? 'Actualizar' : 'Crear'}
        </button>
        {userToEdit && onCancel && (
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
