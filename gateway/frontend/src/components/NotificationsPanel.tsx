import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsService, Notification } from '../services/notifications';
import './NotificationsPanel.css';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onCountUpdate: (count: number) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    isOpen,
    onClose,
    onCountUpdate,
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const data = await notificationsService.getAll();
            setNotifications(data);
            const unreadCount = data.filter((n) => !n.isRead).length;
            onCountUpdate(unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await notificationsService.markAsRead(id);
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );
            onCountUpdate(notifications.filter((n) => !n.isRead && n.id !== id).length);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await notificationsService.delete(id);
            // Optimistic update
            const updated = notifications.filter((n) => n.id !== id);
            setNotifications(updated);
            onCountUpdate(updated.filter((n) => !n.isRead).length);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            handleMarkAsRead({ stopPropagation: () => { } } as any, notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ALERT':
                return '⚠️';
            case 'APPROVAL':
                return '📝';
            case 'INFO':
                return 'ℹ️';
            default:
                return '📬';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) return null;

    return (
        <div className="notifications-panel">
            <div className="notifications-header">
                <h3>Notificaciones</h3>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        No tienes notificaciones pendientes
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''} priority-${notification.priority.toLowerCase()}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-content">
                                <div className="notification-icon">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="notification-details">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-message">{notification.message}</div>
                                    <div className="notification-meta">
                                        <span>{formatDate(notification.createdAt)}</span>
                                        <div className="notification-actions">
                                            {!notification.isRead && (
                                                <button
                                                    className="action-button mark-read-btn"
                                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                    title="Marcar como leída"
                                                >
                                                    ✔
                                                </button>
                                            )}
                                            <button
                                                className="action-button delete-btn"
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
