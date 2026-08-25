// Standard API response envelope
export interface ApiResponse<T> {
    data: T;
    meta?: PaginationMeta;
    error?: ApiError;
}

export interface PaginationMeta {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    nextPage?: number | null;
    prevPage?: number | null;
}

export interface ApiError {
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// Auth types
export interface AuthResponse {
    data: {
        user: import('./user.types').User;
        token: string;
    };
}

export interface AdminAuthResponse {
    data: {
        admin: import('./user.types').AdminUser;
        token: string;
    };
}

export interface OtpResponse {
    data: {
        message: string;
    };
}
