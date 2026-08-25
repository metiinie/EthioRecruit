import api from './api';

export const notificationService = {
    getNotifications: () => api.get('/notifications').then((r) => r.data),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`).then((r) => r.data),
    markAllAsRead: () => api.put('/notifications/read-all').then((r) => r.data),
};
