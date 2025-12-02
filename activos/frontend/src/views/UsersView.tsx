import { useState } from 'react';
import UserForm from '@components/UserForm';
import UserList from '@components/UserList';
import { User } from '@services/api';

export default function UsersView() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleUpdated = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <p>Administra los usuarios del sistema.</p>
      <div className="card">
        <UserForm 
          onCreated={handleCreated} 
          userToEdit={editingUser}
          onUpdated={handleUpdated}
          onCancel={handleCancel}
        />
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <UserList key={refreshKey} onEdit={handleEdit} />
      </div>
    </div>
  );
}
