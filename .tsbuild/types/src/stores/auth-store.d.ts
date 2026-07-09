import type { UserProfile } from "../lib/api/auth";
export interface AuthState {
    user: UserProfile | null;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    setAuth: (user: UserProfile, accessToken: string, refreshToken: string, expiresAt: number) => void;
    setUser: (user: UserProfile) => void;
    setLoading: (loading: boolean) => void;
    setTokens: (accessToken: string, refreshToken: string, expiresAt: number) => void;
    clearAuth: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "setState" | "persist"> & {
    setState(partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: false | undefined): unknown;
    setState(state: AuthState | ((state: AuthState) => AuthState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            accessToken: string | null;
            refreshToken: string | null;
            expiresAt: number | null;
            user: UserProfile | null;
            isAuthenticated: boolean;
            isAdmin: boolean;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            accessToken: string | null;
            refreshToken: string | null;
            expiresAt: number | null;
            user: UserProfile | null;
            isAuthenticated: boolean;
            isAdmin: boolean;
        }, unknown>>;
    };
}>;
