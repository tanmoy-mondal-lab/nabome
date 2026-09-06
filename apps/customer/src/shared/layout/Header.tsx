import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  User,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import { Button } from '@nabome/ui';
import { SearchInput } from '@nabome/ui';

import type { CartItem } from '@/features/cart/types';

import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { useWishlistStore } from '@/stores/wishlist-store';

const EMPTY_CART_ITEMS: CartItem[] = [];

/**
 * Header component following NAVIGATION_ARCHITECTURE.md
 *
 * Features:
 * - Brand logo with home link
 * - Primary navigation (desktop)
 * - Search trigger
 * - Cart with item count
 * - Wishlist with item count
 * - User menu
 * - Mobile menu trigger
 * - Category navigation readiness
 * - Sticky header behavior
 * - Announcement bar readiness
 *
 * Mobile: hamburger menu, search icon, cart, wishlist, user
 * Tablet: expanded navigation
 * Desktop: full navigation with mega menu readiness
 */
export function Header(): ReactNode {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const cart = useCartStore((state) => state.cart);
  const cartItems = cart?.items ?? EMPTY_CART_ITEMS;
  const wishlistItems = useWishlistStore((state) => state.items);

  const cartCount = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0,
  );
  const wishlistCount = wishlistItems.length;

  // Handle scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <header
        className={`sticky top-0 z-(--z-sticky) border-b border-(--border-default) bg-(--bg-surface) transition-shadow duration-200 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
        style={{ paddingTop: 'var(--safe-area-inset-top)' }}
      >
        {/* Announcement bar readiness - can be enabled when needed */}
        {/* <div className="bg-(--bg-brand-subtle) px-4 py-2 text-center text-sm text-(--text-brand)">
          Free shipping on orders over $50
        </div> */}

        <div className="mx-auto flex h-16 w-full max-w-(--container-default) items-center justify-between gap-2 px-3 sm:px-4">
          {/* Left: Mobile menu trigger + Brand */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="tap-target shrink-0 px-2 desktop:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link
              to="/"
              className="truncate font-display text-lg sm:text-xl font-semibold tracking-wide text-(--text-primary)"
            >
              নবME
            </Link>
          </div>

          {/* Center: Primary navigation (desktop) */}
          <nav
            className="hidden gap-6 text-sm desktop:flex"
            aria-label="Primary navigation"
          >
            <Link
              to="/shop"
              className="text-(--text-secondary) transition-colors hover:text-(--text-brand) focus:text-(--text-brand) focus:outline-none focus:ring-2 focus:ring-(--border-focus) focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Shop
            </Link>
            <Link
              to="/shop/new-arrivals"
              className="text-(--text-secondary) transition-colors hover:text-(--text-brand) focus:text-(--text-brand) focus:outline-none focus:ring-2 focus:ring-(--border-focus) focus:ring-offset-2 rounded-md px-2 py-1"
            >
              New Arrivals
            </Link>
            <Link
              to="/shop/sale"
              className="text-(--text-secondary) transition-colors hover:text-(--text-brand) focus:text-(--text-brand) focus:outline-none focus:ring-2 focus:ring-(--border-focus) focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Sale
            </Link>
            <Link
              to="/shop"
              className="text-(--text-secondary) transition-colors hover:text-(--text-brand) focus:text-(--text-brand) focus:outline-none focus:ring-2 focus:ring-(--border-focus) focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Categories
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {/* Search trigger */}
            <Button
              variant="ghost"
              size="sm"
              className="tap-target px-2"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex items-center justify-center tap-target"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="h-5 w-5 text-(--text-secondary)" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--bg-brand) text-xs font-medium text-(--text-on-brand)">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center tap-target"
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingCart className="h-5 w-5 text-(--text-secondary)" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--bg-brand) text-xs font-medium text-(--text-on-brand)">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <Link
              to="/account"
              className="flex items-center justify-center tap-target"
              aria-label="Account"
            >
              <User className="h-5 w-5 text-(--text-secondary)" />
            </Link>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="tap-target px-2"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Sun className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-(--z-modal) bg-(--bg-overlay) backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-(--z-modal) w-full max-w-sm transform bg-(--bg-surface) shadow-xl transition-transform duration-300 ease-in-out desktop:hidden ${
          isMobileMenuOpen
            ? 'translate-x-0 visible'
            : '-translate-x-full invisible'
        }`}
        style={{ paddingTop: 'var(--safe-area-inset-top)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-(--border-default)">
          <span className="font-display text-lg font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            className="tap-target px-2"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col p-4" aria-label="Mobile navigation">
          <Link
            to="/shop"
            className="flex items-center justify-between border-b border-(--border-subtle) py-4 text-(--text-primary) hover:text-(--text-brand)"
          >
            Shop
          </Link>
          <Link
            to="/shop/new-arrivals"
            className="flex items-center justify-between border-b border-(--border-subtle) py-4 text-(--text-primary) hover:text-(--text-brand)"
          >
            New Arrivals
          </Link>
          <Link
            to="/shop/sale"
            className="flex items-center justify-between border-b border-(--border-subtle) py-4 text-(--text-primary) hover:text-(--text-brand)"
          >
            Sale
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center justify-between border-b border-(--border-subtle) py-4 text-(--text-primary) hover:text-(--text-brand)"
          >
            Wishlist
          </Link>
          <Link
            to="/account"
            className="flex items-center justify-between border-b border-(--border-subtle) py-4 text-(--text-primary) hover:text-(--text-brand)"
          >
            Account
          </Link>
        </nav>
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-(--z-modal) bg-(--bg-overlay) backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Search drawer */}
      {isSearchOpen && (
        <div
          className="fixed inset-x-0 top-0 z-(--z-modal) bg-(--bg-surface) shadow-xl"
          style={{ paddingTop: 'var(--safe-area-inset-top)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="flex h-16 items-center gap-3 px-4 border-b border-(--border-default)">
            <Search className="h-5 w-5 text-(--text-tertiary)" />
            <SearchInput
              placeholder="Search products..."
              className="flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="tap-target px-2"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Search suggestions, recent searches, etc. can be added here */}
        </div>
      )}
    </>
  );
}
