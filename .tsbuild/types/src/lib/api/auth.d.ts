export interface LoginRequest {
    email: string;
    password: string;
    turnstileToken?: string;
    rememberMe?: boolean;
}
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    turnstileToken?: string;
}
export interface AuthResponse {
    user: UserProfile;
    message?: string;
}
export interface UserProfile {
    id: string;
    email: string;
    role: "customer" | "admin";
    firstName: string;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    lastLoginAt: string | null;
    loginCount: number;
    preferences?: Record<string, unknown> | null;
    createdAt?: string;
    _count?: {
        orders: number;
        addresses: number;
        wishlistItems: number;
        reviews: number;
    };
}
export interface AuthSession {
    id: string;
    deviceName: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    lastActiveAt: string;
    createdAt: string;
    expiresAt: string;
}
export declare const authApi: {
    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<{
        user?: {
            id: string;
            email: string;
            firstName: string;
        };
        message: string;
        emailSent?: boolean;
        accountExists?: boolean;
    }>;
    logout: () => Promise<{
        message: string;
    }>;
    refresh: () => Promise<{
        message: string;
    }>;
    me: () => Promise<{
        user: UserProfile;
    }>;
    updateMe: (data: Partial<Pick<UserProfile, "firstName" | "lastName" | "phone" | "avatarUrl"> & {
        preferences: Record<string, unknown>;
    }>) => Promise<{
        user: UserProfile;
    }>;
    forgotPassword: (email: string, turnstileToken?: string) => Promise<{
        message: string;
    }>;
    verifyResetCode: (email: string, code: string, turnstileToken?: string) => Promise<{
        message: string;
    }>;
    resetPassword: (email: string, code: string, password: string, turnstileToken?: string) => Promise<{
        message: string;
    }>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{
        message: string;
    }>;
    getSessions: () => Promise<{
        sessions: AuthSession[];
    }>;
    deleteSession: (sessionId: string) => Promise<{
        message: string;
    }>;
    verifyEmail: (data: {
        email: string;
        code: string;
        turnstileToken?: string;
    }) => Promise<{
        message: string;
    }>;
    resendVerification: (email: string, turnstileToken?: string) => Promise<{
        message: string;
    }>;
    changeEmail: (newEmail: string) => Promise<{
        message: string;
    }>;
    verifyEmailChange: (code: string) => Promise<{
        message: string;
    }>;
};
