// ─────────────────────────────────────────────────────────────
// AUTH STORE — Zustand-based auth state management
// Security: No localStorage persistence - tokens stored in httpOnly cookies
// Only stores user data and authentication state in memory
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import type { UserProfile } from "../lib/api/auth";

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set, _get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  setAuth: (user) =>
    set({
      user,
      isAuthenticated: true,
      isAdmin: user.role === "admin",
      isLoading: false,
    }),

  setUser: (user) =>
    set({
      user,
      isAdmin: user.role === "admin",
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    }),
}));
