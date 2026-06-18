import { create } from "zustand";

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  activeMegaMenu: string | null;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  setActiveMegaMenu: (label: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartOpen: false,
  isWishlistOpen: false,
  activeMegaMenu: null,

  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openSearch: () => set({ isSearchOpen: true, activeMegaMenu: null }),
  closeSearch: () => set({ isSearchOpen: false }),

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  openWishlist: () => set({ isWishlistOpen: true }),
  closeWishlist: () => set({ isWishlistOpen: false }),

  setActiveMegaMenu: (label) => set({ activeMegaMenu: label }),
}));
