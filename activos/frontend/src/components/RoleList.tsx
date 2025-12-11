import { Role } from '@services/api';

type Props = {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
};

export default function RoleList({ roles, onEdit, onDelete }: Props) {
  if (roles.length === 0) {
    return (
      <div className="empty-state">
        <p>📋 No hay roles registrados</p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Crea el primer rol para asignarlo a tus usuarios
        </p>
      </div>
    );
  }

  const handleDelete = (role: Role) => {
    const usersCount = role._count?.users || 0;
    if (usersCount > 0) {
      if (confirm(`El rol "${role.name}" tiene ${usersCount} usuario(s) asignado(s). ¿Deseas eliminarlo de todas formas?`)) {
        onDelete(role.id);
      }
    } else {
      if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
        onDelete(role.id);
      }
    }
  };

  return (
    <div className="list-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Usuarios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td><strong>{role.name}</strong></td>
              <td>{role.description || <em style={{ color: '#999' }}>Sin descripción</em>}</td>
              <td>{role._count?.users || 0}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => onEdit(role)} className="btn-sm">
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(role)}
                    className="btn-sm danger"
                    disabled={role._count && role._count.users > 0}
                    style={{ color: '#dc2626', borderColor: '#fecaca' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
