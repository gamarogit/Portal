import api from './api';

export interface Notification {
    id: string;
    userId?: string;
    role?: string;
    type: 'ALERT' | 'APPROVAL' | 'INFO';
    title: string;
    message: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    link?: string;
    isRead: boolean;
    createdAt: string;
    sourceId?: string;
    sourceType?: string;
}

export const notificationsService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markAsRead: async (id: string): Promise<Notification> => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/notifications/${id}`);
    },
};
