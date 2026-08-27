import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { hasRole } from '@nabome/auth';
import type { User } from '@nabome/types';

/**
 * Auth store — holds the profile only (tokens live in httpOnly cookies).
 * Role checks use the additive @nabome/auth hierarchy: shop_owner or higher
 * (admin/system) may access the shop dashboard.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** one of: idle | loading | authenticated | guest */
  status: 'idle' | 'loading' | 'authenticated' | 'guest';
  setUser: (user: User) => void;
  clearUser: () => void;
  /** Whether the current user may act as a shop owner. */
  isShopOwner: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      status: 'guest',
      setUser: (user) =>
        set({ user, isAuthenticated: true, status: 'authenticated' }),
      clearUser: () =>
        set({ user: null, isAuthenticated: false, status: 'guest' }),
      isShopOwner: () => {
        const user = get().user;
        return user !== null && hasRole(user.role, 'shop_owner');
      },
    }),
    {
      name: 'nabome-shop-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
