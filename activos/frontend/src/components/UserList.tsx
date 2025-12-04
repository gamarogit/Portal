import { useState, useEffect } from 'react';
import { userService, User } from '@services/api';

type Props = {
  onEdit: (user: User) => void;
};

import { useTheme } from '@contexts/ThemeContext';

export default function UserList({ onEdit }: Props) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.list();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario "${name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await userService.delete(id);
      await loadUsers();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al eliminar usuario';
      alert(message);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-list">
      <h3>Usuarios registrados ({users.length})</h3>
      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role?.name || <em style={{ color: '#999' }}>Sin rol</em>}</td>
                <td>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                <td>
                  <button
                    onClick={() => onEdit(user)}
                    className="ghost"
                    style={{
                      color: theme?.primaryColor || '#2563eb',
                      borderColor: theme?.primaryColor || '#cbd5f5'
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="ghost"
                    style={{ color: '#ef4444' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
