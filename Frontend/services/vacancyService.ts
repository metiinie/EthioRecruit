import api from './api';

export const vacancyService = {
    // Public
    getVacancies: (params?: any) =>
        api.get('/vacancies', { params }).then((r) => r.data),

    getVacancyById: (id: string) =>
        api.get(`/vacancies/${id}`).then((r) => r.data),

    applyToVacancy: (id: string, data?: { coverLetter?: string }) =>
        api.post(`/vacancies/${id}/apply`, data).then((r) => r.data),

    // Admin
    getAdminVacancies: (params?: any) =>
        api.get('/admin/vacancies', { params }).then((r) => r.data),

    createVacancy: (data: any) =>
        api.post('/admin/vacancies', data).then((r) => r.data),

    updateVacancy: (id: string, data: any) =>
        api.put(`/admin/vacancies/${id}`, data).then((r) => r.data),

    updateVacancyStatus: (id: string, status: string) =>
        api.put(`/admin/vacancies/${id}/status`, { status }).then((r) => r.data),
};
