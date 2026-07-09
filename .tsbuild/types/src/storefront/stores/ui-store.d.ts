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
export declare const useUIStore: import("zustand").UseBoundStore<import("zustand").StoreApi<UIState>>;
export {};
