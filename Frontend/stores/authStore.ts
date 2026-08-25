import { create } from 'zustand';

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

    setAuth: (user: User, token: string) => void;
    setMode: (mode: 'JOB_SEEKER' | 'EMPLOYER') => void;
    setToken: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    mode: 'JOB_SEEKER',
    isPhoneVerified: false,
    isAuthenticated: false,

    setAuth: (user, token) =>
        set({
            user,
            token,
            mode: user.preferredMode,
            isPhoneVerified: user.phoneVerified,
            isAuthenticated: true,
        }),

    setMode: (mode) =>
        set((state) => ({
            mode,
            user: state.user ? { ...state.user, preferredMode: mode } : null,
        })),

    setToken: (token) => set({ token }),

    logout: () =>
        set({
            user: null,
            token: null,
            mode: 'JOB_SEEKER',
            isPhoneVerified: false,
            isAuthenticated: false,
        }),
}));
