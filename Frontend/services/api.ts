import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';

export function getDynamicBaseUrl(): string {
    // 1. Explicit env override
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) {
        return envUrl;
    }

    // 2. Web environment: MUST strictly match the active browser hostname (window.location.hostname)
    // NEVER fall through to Metro hostUri on Web to avoid browser cross-origin preflight blocking
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.location?.hostname) {
            const host = window.location.hostname;
            const port = 3000;
            return `http://${host}:${port}/v1`;
        }
        return 'http://localhost:3000/v1';
    }

    // 3. Mobile Expo Go / Native App: Dynamically detect Metro bundler host IP
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
            return `http://${ip}:3000/v1`;
        }
    }

    // 4. Android emulator fallback (10.0.2.2 bridges to developer machine localhost)
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/v1';
    }

    // 5. Default fallback
    return 'http://localhost:3000/v1';
}

export const API_URL = getDynamicBaseUrl();

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
        const activeUrl = error.config?.baseURL || getDynamicBaseUrl();
        return `Network error: Unable to reach server at ${activeUrl}. Please verify the backend is running and reachable.`;
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

// Dynamic base URL resolution + Authorization interceptor
api.interceptors.request.use((config) => {
    // Re-evaluate base URL dynamically per request so physical devices/emulators resolve correct host IP
    config.baseURL = getDynamicBaseUrl();

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

