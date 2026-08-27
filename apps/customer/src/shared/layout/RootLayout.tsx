import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { CookieBanner } from '@/shared/layout/CookieBanner';
import { GlobalLoading } from '@/shared/layout/GlobalLoading';
import { OfflineIndicator } from '@/shared/layout/OfflineIndicator';

import { BottomNavigation } from './BottomNavigation';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Root Layout — production-ready application shell following NAVIGATION_ARCHITECTURE.md
 * and RESPONSIVE_LAYOUT_ARCHITECTURE.md.
 *
 * Features:
 * - Responsive layout with safe area support for mobile devices
 * - Viewport handling with viewport-fit=cover for notched devices
 * - Scroll restoration for better UX
 * - Skip navigation for accessibility
 * - Global loading state
 * - Error boundary integration
 * - Offline indicator
 * - Cookie banner readiness
 * - Layout persistence
 *
 * Mobile-first: bottom navigation on small screens, header links on larger.
 */
export function RootLayout(): ReactNode {
  const location = useLocation();

  // Scroll to top on route change (except for hash navigation)
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  // Set safe area insets for mobile devices with notches
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      '--safe-area-inset-top',
      'env(safe-area-inset-top, 0px)',
    );
    root.style.setProperty(
      '--safe-area-inset-bottom',
      'env(safe-area-inset-bottom, 0px)',
    );
    root.style.setProperty(
      '--safe-area-inset-left',
      'env(safe-area-inset-left, 0px)',
    );
    root.style.setProperty(
      '--safe-area-inset-right',
      'env(safe-area-inset-right, 0px)',
    );
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-(--bg-page) text-(--text-primary)">
      {/* Skip navigation link for accessibility (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-(--z-tooltip) focus:bg-(--bg-surface) focus:px-4 focus:py-2 focus:outline-none focus:ring-2 focus:ring-(--border-focus)"
      >
        Skip to main content
      </a>

      {/* Header with sticky behavior */}
      <Header />

      {/* Main content area with scroll restoration */}
      <main
        id="main-content"
        className="flex-1"
        style={{
          paddingTop: 'var(--safe-area-inset-top)',
          paddingBottom: 'var(--safe-area-inset-bottom)',
        }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Bottom navigation for mobile/tablet */}
      <BottomNavigation />

      {/* Global components */}
      <GlobalLoading />
      <OfflineIndicator />
      <CookieBanner />

      {/* React Router scroll restoration */}
      <ScrollRestoration />
    </div>
  );
}
