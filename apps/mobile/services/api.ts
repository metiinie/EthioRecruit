import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach user JWT to requests
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const adminToken = useAdminAuthStore.getState().adminToken;

    // Use admin token for admin routes
    if (config.url?.startsWith('/admin') && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle 401 responses (expired tokens)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            if (url.startsWith('/admin')) {
                useAdminAuthStore.getState().logout();
            } else {
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    },
);

export default api;
