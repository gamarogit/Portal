import { useState, useEffect } from 'react';
import { roleService, Role } from '@services/api';
import RoleForm from '@components/RoleForm';
import RoleList from '@components/RoleList';

export default function RolesView() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.list();
      setRoles(data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar roles';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleEdit = (role: Role) => {
    setRoleToEdit(role);
  };

  const handleCancelEdit = () => {
    setRoleToEdit(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await roleService.delete(id);
      await loadRoles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar rol';
      alert(message);
    }
  };

  return (
    <div className="view-container">
      <header className="view-header">
        <h2>📋 Gestión de Roles</h2>
        <p>Administra los roles que se asignarán a los usuarios de la empresa</p>
      </header>

      <div className="view-content">
        <RoleForm
          onCreated={loadRoles}
          roleToEdit={roleToEdit}
          onUpdated={() => {
            loadRoles();
            setRoleToEdit(null);
          }}
          onCancel={handleCancelEdit}
        />

        {loading && <p>Cargando roles...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <RoleList roles={roles} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
