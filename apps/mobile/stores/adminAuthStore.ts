import { create } from 'zustand';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
    organizationId: string;
    organization?: {
        id: string;
        name: string;
        logoUrl?: string | null;
    };
}

interface AdminAuthState {
    admin: AdminUser | null;
    adminToken: string | null;
    agencyId: string | null;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | null;
    isAdminAuthenticated: boolean;

    setAdminAuth: (admin: AdminUser, token: string) => void;
    logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
    admin: null,
    adminToken: null,
    agencyId: null,
    role: null,
    isAdminAuthenticated: false,

    setAdminAuth: (admin, token) =>
        set({
            admin,
            adminToken: token,
            agencyId: admin.organizationId,
            role: admin.role,
            isAdminAuthenticated: true,
        }),

    logout: () =>
        set({
            admin: null,
            adminToken: null,
            agencyId: null,
            role: null,
            isAdminAuthenticated: false,
        }),
}));
