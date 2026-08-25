import api from './api';

export interface RegisterData {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
}

export interface LoginData {
    phone: string;
    password: string;
}

export interface AdminLoginData {
    email: string;
    password: string;
}

// ── User Auth ──────────────────────────────────
export const authService = {
    register: (data: RegisterData) =>
        api.post('/auth/register', data).then((r) => r.data),

    login: (data: LoginData) =>
        api.post('/auth/login', data).then((r) => r.data),

    sendOtp: (phone: string, purpose?: string) =>
        api.post('/auth/otp/send', { phone, purpose }).then((r) => r.data),

    verifyOtp: (phone: string, code: string) =>
        api.post('/auth/otp/verify', { phone, code }).then((r) => r.data),

    switchMode: (mode: 'JOB_SEEKER' | 'EMPLOYER') =>
        api.put('/auth/mode', { mode }).then((r) => r.data),

    getMe: () =>
        api.get('/users/me').then((r) => r.data),
};

// ── Admin Auth ─────────────────────────────────
export const adminAuthService = {
    login: (data: AdminLoginData) =>
        api.post('/admin/auth/login', data).then((r) => r.data),
};
