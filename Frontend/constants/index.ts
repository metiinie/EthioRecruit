// EthioHire Design System Constants

export const Colors = {
    // Primary palette — deep navy + teal accent
    primary: '#0F172A',       // Slate 900 — main backgrounds
    primaryLight: '#1E293B',  // Slate 800 — cards, elevated surfaces
    accent: '#14B8A6',        // Teal 500 — CTAs, highlights
    accentLight: '#2DD4BF',   // Teal 400 — hover states
    accentDark: '#0D9488',    // Teal 600 — pressed states

    // Neutrals
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',

    // Semantic
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Background
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceDark: '#0F172A',
};

export const Fonts = {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const QUERY_KEYS = {
    me: ['me'],
    candidates: ['candidates'],
    candidate: (id: string) => ['candidate', id],
    vacancies: ['vacancies'],
    vacancy: (id: string) => ['vacancy', id],
    applications: ['activity', 'applications'],
    inquiries: ['activity', 'inquiries'],
    savedCandidates: ['saved', 'candidates'],
    savedVacancies: ['saved', 'vacancies'],
    conversations: ['conversations'],
    notifications: ['notifications'],
    adminCandidates: (agencyId: string) => ['admin', 'candidates', agencyId],
    adminVacancies: (agencyId: string) => ['admin', 'vacancies', agencyId],
    adminPipeline: (agencyId: string) => ['admin', 'pipeline', agencyId],
    adminInquiries: (agencyId: string) => ['admin', 'inquiries', agencyId],
    adminApplications: (agencyId: string) => ['admin', 'applications', agencyId],
    adminStaff: (agencyId: string) => ['admin', 'staff', agencyId],
} as const;
