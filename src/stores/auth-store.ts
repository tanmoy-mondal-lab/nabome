// ─────────────────────────────────────────────────────────────
// AUTH STORE — Zustand-based auth state management
// Persists tokens to localStorage for session restoration
// Supports refresh token rotation and auto-logout events
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "../lib/api/auth";

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string, expiresAt: number) => void;
  setUser: (user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string, expiresAt: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken, expiresAt) =>
        set({
          user,
          accessToken,
          refreshToken,
          expiresAt,
          isAuthenticated: true,
          isAdmin: user.role === "super_admin",
          isLoading: false,
        }),

      setUser: (user) =>
        set({
          user,
          isAdmin: user.role === "super_admin",
        }),

      setTokens: (accessToken, refreshToken, expiresAt) =>
        set({ accessToken, refreshToken, expiresAt }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        }),
    }),
    {
      name: "nabome-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
