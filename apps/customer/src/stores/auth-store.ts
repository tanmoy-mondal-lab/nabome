import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@nabome/types';

/**
 * Global auth store (CLIENT_ARCHITECTURE_SPECIFICATION §2.3) — holds the user
 * PROFILE only. Tokens live in httpOnly cookies and never touch this store.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** one of: idle | loading | authenticated | guest */
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      status: 'guest',
      setUser: (user) =>
        set({ user, isAuthenticated: true, status: 'authenticated' }),
      clearUser: () =>
        set({ user: null, isAuthenticated: false, status: 'guest' }),
    }),
    {
      name: 'nabome-auth',
      // Persist only the profile — never tokens (CLIENT spec §2.3.2).
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
