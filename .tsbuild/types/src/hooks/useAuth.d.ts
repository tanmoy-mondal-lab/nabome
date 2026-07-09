import { authApi, type LoginRequest, type RegisterRequest } from "../lib/api/auth";
export declare function useAuth(): {
    user: import("../lib/api/auth").UserProfile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: LoginRequest) => Promise<import("../lib/api/auth").UserProfile>;
    register: (data: RegisterRequest) => Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
        };
        message: string;
    }>;
    logout: () => Promise<void>;
    resendVerification: (email: string, turnstileToken?: string) => Promise<{
        message: string;
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
    updateProfile: (data: Parameters<typeof authApi.updateMe>[0]) => Promise<import("../lib/api/auth").UserProfile>;
};
