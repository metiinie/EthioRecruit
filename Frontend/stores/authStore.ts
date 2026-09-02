import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredMode: 'JOB_SEEKER' | 'EMPLOYER';
    phoneVerified: boolean;
    profilePhoto?: string | null;
    [key: string]: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    mode: 'JOB_SEEKER' | 'EMPLOYER';
    isPhoneVerified: boolean;
    isAuthenticated: boolean;
    isHydrated: boolean;

    setAuth: (user: User, token: string) => void;
    setMode: (mode: 'JOB_SEEKER' | 'EMPLOYER') => void;
    setToken: (token: string) => void;
    logout: () => void;
    hydrate: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'ethio_auth_state';

async function persistToStorage(data: { user: User; token: string }) {
    try {
        const json = JSON.stringify(data);
        if (Platform.OS === 'web') {
            localStorage.setItem(AUTH_STORAGE_KEY, json);
        } else {
            await SecureStore.setItemAsync(AUTH_STORAGE_KEY, json);
        }
    } catch (e) {
        console.warn('[AuthStore] Failed to persist auth state:', e);
    }
}

async function clearStorage() {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } else {
            await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
        }
    } catch (e) {
        console.warn('[AuthStore] Failed to clear auth state:', e);
    }
}

async function loadFromStorage(): Promise<{ user: User; token: string } | null> {
    try {
        let json: string | null = null;
        if (Platform.OS === 'web') {
            json = localStorage.getItem(AUTH_STORAGE_KEY);
        } else {
            json = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
        }
        if (json) return JSON.parse(json);
    } catch (e) {
        console.warn('[AuthStore] Failed to load persisted auth:', e);
    }
    return null;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    mode: 'JOB_SEEKER',
    isPhoneVerified: false,
    isAuthenticated: false,
    isHydrated: false,

    setAuth: (user, token) => {
        set({
            user,
            token,
            mode: user.preferredMode,
            isPhoneVerified: user.phoneVerified,
            isAuthenticated: true,
        });
        persistToStorage({ user, token });
    },

    setMode: (mode) =>
        set((state) => ({
            mode,
            user: state.user ? { ...state.user, preferredMode: mode } : null,
        })),

    setToken: (token) => set({ token }),

    logout: () => {
        set({
            user: null,
            token: null,
            mode: 'JOB_SEEKER',
            isPhoneVerified: false,
            isAuthenticated: false,
        });
        clearStorage();
    },

    hydrate: async () => {
        const saved = await loadFromStorage();
        if (saved?.user && saved?.token) {
            set({
                user: saved.user,
                token: saved.token,
                mode: saved.user.preferredMode,
                isPhoneVerified: saved.user.phoneVerified,
                isAuthenticated: true,
            });
        }
        set({ isHydrated: true });
    },
}));
