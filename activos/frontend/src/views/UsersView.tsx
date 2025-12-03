import { useState } from 'react';
import UserForm from '@components/UserForm';
import UserList from '@components/UserList';
import { User } from '@services/api';

export default function UsersView() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setIsCreating(false);
  };

  const handleUpdated = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingUser(null);
    setIsCreating(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Gestión de Usuarios</h2>
          <p>Administra los usuarios del sistema.</p>
        </div>
        {!isCreating && !editingUser && (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Nuevo Usuario
          </button>
        )}
      </div>

      {(isCreating || editingUser) && (
        <div className="card">
          <UserForm
            onCreated={handleCreated}
            userToEdit={editingUser}
            onUpdated={handleUpdated}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <UserList key={refreshKey} onEdit={handleEdit} />
      </div>
    </div>
  );
}
