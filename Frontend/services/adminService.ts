import api from './api';

export const adminService = {
    // Staff
    getStaff: () => api.get('/admin/staff').then((r) => r.data),
    addStaff: (data: { email: string; firstName: string; lastName: string; role: string; password?: string }) =>
        api.post('/admin/staff', data).then((r) => r.data),
    toggleStaffActive: (id: string, isActive: boolean) =>
        api.put(`/admin/staff/${id}/active`, { isActive }).then((r) => r.data),

    // Settings
    getSettings: () => api.get('/admin/settings').then((r) => r.data),
    updateSettings: (data: any) => api.put('/admin/settings', data).then((r) => r.data),
    addContactChannel: (data: { type: string; value: string; label?: string }) =>
        api.post('/admin/settings/channels', data).then((r) => r.data),
};
