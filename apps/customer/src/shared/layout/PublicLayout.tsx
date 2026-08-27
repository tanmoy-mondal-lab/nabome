import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router';

import { Button } from '@nabome/ui';

import { useUiStore } from '@/stores/ui-store';

/**
 * Public site layout — shared chrome for the customer website.
 * Mobile-first: bottom navigation on small screens, header links on larger.
 */
export function PublicLayout(): ReactNode {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="flex min-h-dvh flex-col bg-(--bg-page) text-(--text-primary)">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-(--z-tooltip) focus:bg-(--bg-surface) focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-(--z-sticky) border-b border-(--border-default) bg-(--bg-surface)">
        <div className="mx-auto flex h-16 w-full max-w-(--container-default) items-center justify-between px-4">
          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-wide"
          >
            নবME
          </Link>
          <nav
            className="hidden gap-6 text-sm desktop:flex"
            aria-label="Primary"
          >
            <Link
              to="/shop"
              className="text-(--text-secondary) hover:text-(--text-brand)"
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className="text-(--text-secondary) hover:text-(--text-brand)"
            >
              Cart
            </Link>
            <Link
              to="/account"
              className="text-(--text-secondary) hover:text-(--text-brand)"
            >
              Account
            </Link>
          </nav>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-(--border-default) bg-(--bg-surface)">
        <div className="mx-auto flex w-full max-w-(--container-default) flex-col gap-2 px-4 py-6 text-sm text-(--text-tertiary) tablet:flex-row tablet:items-center tablet:justify-between">
          <p>© {new Date().getFullYear()} নবME (Nabome)</p>
          <nav className="flex gap-4" aria-label="Legal">
            <Link to="/" className="hover:text-(--text-brand)">
              Terms
            </Link>
            <Link to="/" className="hover:text-(--text-brand)">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
