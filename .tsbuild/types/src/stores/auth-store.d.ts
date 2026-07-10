import type { UserProfile } from "../lib/api/auth";
export interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    setAuth: (user: UserProfile) => void;
    setUser: (user: UserProfile) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
