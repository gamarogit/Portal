import { useEffect, useState } from 'react';
import api from '@services/api';

interface Notification {
  id: string;
  type: string;
  severity: string;
  message: string;
  entityId: string;
  entityType: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const params = filter === 'unread' ? { isRead: false } : {};
      const res = await api.get('/notifications', { params });
      console.log('Notifications response:', res.data);
      const notifData = Array.isArray(res.data) ? res.data : [];
      setNotifications(notifData);
    } catch (err: any) {
      console.error('Error cargando notificaciones:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) {
      alert('Error marcando como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      loadNotifications();
    } catch (err) {
      alert('Error marcando todas como leídas');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🔵';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WARRANTY_EXPIRING': return '⚠️';
      case 'MAINTENANCE_DUE': return '🔧';
      case 'MAINTENANCE_OVERDUE': return '❌';
      case 'ASSET_UNASSIGNED': return '📦';
      default: return '🔔';
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando notificaciones...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>🔔 Notificaciones ({unreadCount} sin leer)</h2>
        <div>
          <button onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')} style={{ marginRight: '0.5rem' }}>
            {filter === 'all' ? 'Ver sin leer' : 'Ver todas'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {notifications.map(notif => (
          <div
            key={notif.id}
            style={{
              padding: '1rem',
              background: notif.isRead ? '#f8f9fa' : '#fff',
              border: `2px solid ${notif.isRead ? '#dee2e6' : getSeverityColor(notif.severity)}`,
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(notif.type)}</span>
                <span style={{ fontSize: '1.5rem' }}>{getSeverityIcon(notif.severity)}</span>
                <strong>{notif.type.replace(/_/g, ' ')}</strong>
                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, color: '#495057' }}>{notif.message}</p>
              <small style={{ color: '#6c757d' }}>
                {notif.entityType}: {notif.entityId}
              </small>
            </div>
            <div>
              {!notif.isRead && (
                <button onClick={() => handleMarkAsRead(notif.id)}>
                  Marcar como leída
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
          {filter === 'all' ? 'No hay notificaciones' : 'No hay notificaciones sin leer'}
        </p>
      )}
    </div>
  );
}
