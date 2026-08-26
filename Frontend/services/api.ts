import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';

const getBaseUrl = (): string => {
    // 1. Dynamic host IP detection from Expo Metro bundler connection
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
            return `http://${ip}:3000/v1`;
        }
    }

    // 2. Explicit environment variable if valid and not stale IP
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('10.78.243.80')) {
        return envUrl;
    }

    // 3. Current active network fallback
    return 'http://10.103.196.169:3000/v1';
};

export const API_URL = getBaseUrl();

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});


/**
 * Extracts a human-readable error message from Axios errors, NestJS validation arrays, or network failures.
 */
export function getErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred';

    // Network error (server unreachable / offline)
    if (!error.response) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return 'Connection timed out. Please check your internet connection.';
        }
        return `Network error: Unable to reach server (${error.config?.baseURL || API_URL}). Please verify backend is running on the same network.`;
    }

    const data = error.response.data;
    if (data?.error?.message) {
        const msg = data.error.message;
        return Array.isArray(msg) ? msg.join('\n') : String(msg);
    }
    if (data?.message) {
        return Array.isArray(data.message) ? data.message.join('\n') : String(data.message);
    }

    return error.message || 'Request failed';
}

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

