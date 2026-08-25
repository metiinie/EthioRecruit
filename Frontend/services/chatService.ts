import api from './api';

export const chatService = {
    getConversations: () => api.get('/conversations/my').then((r) => r.data),
    startConversation: (agencyId: string) => api.post('/conversations/start', { agencyId }).then((r) => r.data),
    getMessages: (conversationId: string, limit = 50, offset = 0) =>
        api.get(`/conversations/${conversationId}/messages`, { params: { limit, offset } }).then((r) => r.data),
    sendMessage: (conversationId: string, text: string, attachmentUrl?: string) =>
        api.post(`/conversations/${conversationId}/messages`, { text, attachmentUrl }).then((r) => r.data),
    markAsRead: (conversationId: string) => api.post(`/conversations/${conversationId}/read`).then((r) => r.data),
};
