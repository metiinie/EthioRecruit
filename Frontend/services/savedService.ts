import api from './api';

export const savedService = {
    getSavedCandidates: () => api.get('/saved/candidates').then((r) => r.data),
    saveCandidate: (candidateId: string) => api.post(`/saved/candidates/${candidateId}`).then((r) => r.data),
    unsaveCandidate: (candidateId: string) => api.delete(`/saved/candidates/${candidateId}`).then((r) => r.data),

    getSavedVacancies: () => api.get('/saved/vacancies').then((r) => r.data),
    saveVacancy: (vacancyId: string) => api.post(`/saved/vacancies/${vacancyId}`).then((r) => r.data),
    unsaveVacancy: (vacancyId: string) => api.delete(`/saved/vacancies/${vacancyId}`).then((r) => r.data),
};
