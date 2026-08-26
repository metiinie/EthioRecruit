import api from './api';
import { CandidateFiltersDto } from '../types/dto';

export const candidateService = {
    // Public
    getCandidates: (params?: CandidateFiltersDto) =>
        api.get('/candidates', { params }).then((r) => r.data),

    getCandidateById: (id: string) =>
        api.get(`/candidates/${id}`).then((r) => r.data),

    submitInquiry: (id: string, data: { message: string; preferredContactChannel?: string; purpose?: string }) =>
        api.post(`/candidates/${id}/inquiry`, data).then((r) => r.data),

    // Admin
    getAdminCandidates: (params?: any) =>
        api.get('/admin/candidates', { params }).then((r) => r.data),

    createCandidate: (data: any) =>
        api.post('/admin/candidates', data).then((r) => r.data),

    updateCandidate: (id: string, data: any) =>
        api.put(`/admin/candidates/${id}`, data).then((r) => r.data),

    softDeleteCandidate: (id: string) =>
        api.delete(`/admin/candidates/${id}`).then((r) => r.data),

    updateMedical: (id: string, data: any) =>
        api.put(`/admin/candidates/${id}/medical`, data).then((r) => r.data),

    getExportCv: (id: string) =>
        api.get(`/candidates/${id}/cv`).then((r) => r.data),
};
