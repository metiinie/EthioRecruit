import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';

const getBaseUrl = (): string => {
    // 1. Web environment: Browser executes on developer machine / web domain
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.location?.hostname) {
            return `http://${window.location.hostname}:3000/v1`;
        }
        return 'http://localhost:3000/v1';
    }

    // 2. Mobile environment (Expo Go / QR Scanning):
    // Prioritize explicit environment variable override for mobile
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) {
        return envUrl;
    }

    // Dynamic host IP detection from Expo Metro bundler connection
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
            return `http://${ip}:3000/v1`;
        }
    }

    // 3. Fallback to localhost
    return 'http://localhost:3000/v1';
};

export const API_URL = getBaseUrl();
if (typeof console !== 'undefined') {
    console.log('🚀 [EthioRecruit API] Target API_URL:', API_URL, '| Platform:', Platform.OS);
}

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

// Attach user or admin JWT to requests with strict session isolation
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const adminToken = useAdminAuthStore.getState().adminToken;

    const url = config.url || '';
    const isAdminRoute = url.startsWith('/admin') || url.startsWith('admin') || url.includes('/admin/');

    // Strict security isolation: Admin routes ONLY use adminToken; User routes ONLY use user token
    const bearerToken = isAdminRoute ? adminToken : token;

    if (bearerToken) {
        config.headers.Authorization = `Bearer ${bearerToken}`;
    }

    return config;
});

// Handle 401 responses gracefully
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            const isAdminRoute = url.startsWith('/admin') || url.startsWith('admin') || url.includes('/admin/');
            if (isAdminRoute) {
                useAdminAuthStore.getState().logout();
            } else {
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    },
);

export default api;

