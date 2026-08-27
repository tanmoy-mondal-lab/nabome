import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global UI store (CLIENT_ARCHITECTURE_SPECIFICATION §2.5) — theme, mobile
 * navigation, global overlay state. Not persisted except the theme.
 */
interface UiState {
  theme: 'light' | 'dark';
  isMobileNavOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      isMobileNavOpen: false,
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme;
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const theme = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.dataset.theme = theme;
          return { theme };
        }),
      openMobileNav: () => set({ isMobileNavOpen: true }),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
      toggleMobileNav: () =>
        set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
    }),
    {
      name: 'nabome-ui',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
