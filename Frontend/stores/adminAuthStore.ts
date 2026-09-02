import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
    agencyId?: string;
    organizationId?: string;
    agency?: {
        id: string;
        name: string;
        logoUrl?: string | null;
    } | null;
    organization?: {
        id: string;
        name: string;
        logoUrl?: string | null;
    } | null;
}

interface AdminAuthState {
    admin: AdminUser | null;
    adminToken: string | null;
    agencyId: string | null;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | null;
    isAdminAuthenticated: boolean;
    isHydrated: boolean;

    setAdminAuth: (admin: AdminUser, token: string) => void;
    logout: () => void;
    hydrate: () => Promise<void>;
}

const ADMIN_STORAGE_KEY = 'ethio_admin_auth_state';

async function persistToStorage(data: { admin: AdminUser; token: string }) {
    try {
        const json = JSON.stringify(data);
        if (Platform.OS === 'web') {
            localStorage.setItem(ADMIN_STORAGE_KEY, json);
        } else {
            await SecureStore.setItemAsync(ADMIN_STORAGE_KEY, json);
        }
    } catch (e) {
        console.warn('[AdminAuthStore] Failed to persist admin auth state:', e);
    }
}

async function clearStorage() {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(ADMIN_STORAGE_KEY);
        } else {
            await SecureStore.deleteItemAsync(ADMIN_STORAGE_KEY);
        }
    } catch (e) {
        console.warn('[AdminAuthStore] Failed to clear admin auth state:', e);
    }
}

async function loadFromStorage(): Promise<{ admin: AdminUser; token: string } | null> {
    try {
        let json: string | null = null;
        if (Platform.OS === 'web') {
            json = localStorage.getItem(ADMIN_STORAGE_KEY);
        } else {
            json = await SecureStore.getItemAsync(ADMIN_STORAGE_KEY);
        }
        if (json) return JSON.parse(json);
    } catch (e) {
        console.warn('[AdminAuthStore] Failed to load persisted admin auth:', e);
    }
    return null;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
    admin: null,
    adminToken: null,
    agencyId: null,
    role: null,
    isAdminAuthenticated: false,
    isHydrated: false,

    setAdminAuth: (admin, token) => {
        set({
            admin,
            adminToken: token,
            agencyId: admin.agencyId || admin.organizationId || null,
            role: admin.role,
            isAdminAuthenticated: true,
        });
        persistToStorage({ admin, token });
    },

    logout: () => {
        set({
            admin: null,
            adminToken: null,
            agencyId: null,
            role: null,
            isAdminAuthenticated: false,
        });
        clearStorage();
    },

    hydrate: async () => {
        const saved = await loadFromStorage();
        if (saved?.admin && saved?.token) {
            set({
                admin: saved.admin,
                adminToken: saved.token,
                agencyId: saved.admin.agencyId || saved.admin.organizationId || null,
                role: saved.admin.role,
                isAdminAuthenticated: true,
            });
        }
        set({ isHydrated: true });
    },
}));
