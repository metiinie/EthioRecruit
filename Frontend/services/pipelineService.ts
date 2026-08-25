import api from './api';

export const pipelineService = {
    getKanbanBoard: (vacancyId?: string) =>
        api.get('/admin/pipeline/kanban', { params: { vacancyId } }).then((r) => r.data),

    moveStage: (applicationId: string, stage: string, notes?: string) =>
        api.put(`/admin/pipeline/applications/${applicationId}/stage`, { stage, notes }).then((r) => r.data),

    getAuditTrail: (applicationId: string) =>
        api.get(`/admin/pipeline/applications/${applicationId}/audit`).then((r) => r.data),
};

export const activityService = {
    getMyApplications: () =>
        api.get('/users/me/applications').then((r) => r.data),

    getMyInquiries: () =>
        api.get('/users/me/inquiries').then((r) => r.data),

    getAdminApplications: (status?: string) =>
        api.get('/admin/applications', { params: { status } }).then((r) => r.data),

    getAdminInquiries: (status?: string) =>
        api.get('/admin/inquiries', { params: { status } }).then((r) => r.data),

    updateInquiryStatus: (id: string, status: string, responseMessage?: string) =>
        api.put(`/admin/inquiries/${id}/status`, { status, responseMessage }).then((r) => r.data),
};
