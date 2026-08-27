import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** UI state — sidebar collapse + mobile drawer + theme. */
interface UiState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
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
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      openMobileNav: () => set({ isMobileNavOpen: true }),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
    }),
    {
      name: 'nabome-shop-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
