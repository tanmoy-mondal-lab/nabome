import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router';

import { buttonVariants } from '@nabome/ui';
import { cn } from '@nabome/utils';

import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

/**
 * ShopLayout — desktop sidebar + mobile drawer for the shop owner dashboard.
 */
export function ShopLayout(): ReactNode {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const sidebarContent = (
    <nav className="flex flex-col gap-1" aria-label="Shop">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--bg-surface-inset) hover:text-(--text-primary)',
              isActive &&
                'bg-(--bg-brand-subtle) font-medium text-(--text-brand)',
              sidebarCollapsed && 'justify-center',
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {!sidebarCollapsed ? <span>{label}</span> : null}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-(--bg-page) text-(--text-primary)">
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-(--z-overlay) bg-(--bg-brand) text-(--text-brand-inverse) px-4 py-2 rounded-md font-medium"
      >
        Skip to main content
      </a>
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 border-r border-(--border-default) bg-(--bg-surface) p-4 transition-[width] duration-(--duration-fast) desktop:flex',
          sidebarCollapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex items-center justify-between">
          {!sidebarCollapsed ? (
            <Link
              to="/dashboard"
              className="font-display text-lg font-semibold"
            >
              <span className="hidden mobile:inline">নবME</span>
              <span className="mobile:hidden">নবME Shop</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={
              sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            className="tap-target rounded-md text-(--text-secondary) hover:text-(--text-primary)"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        {sidebarContent}
      </aside>

      {isMobileNavOpen ? (
        <div
          className="fixed inset-0 z-(--z-overlay) bg-black/40 desktop:hidden"
          onClick={closeMobileNav}
          aria-hidden
        />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-(--z-modal) w-64 -translate-x-full bg-(--bg-surface) p-4 transition-transform duration-(--duration-fast) desktop:hidden',
          isMobileNavOpen && 'translate-x-0',
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="font-display text-lg font-semibold">নবME Shop</span>
          <button
            type="button"
            onClick={closeMobileNav}
            aria-label="Close navigation"
            className="tap-target rounded-md text-(--text-secondary)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center justify-between border-b border-(--border-default) bg-(--bg-surface) px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openMobileNav}
              aria-label="Open navigation"
              className="tap-target rounded-md text-(--text-secondary) desktop:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm text-(--text-secondary)">My shop</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="tap-target rounded-md text-(--text-secondary) hover:text-(--text-primary)"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <span className="hidden text-sm text-(--text-secondary) tablet:inline">
              {user
                ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                  user.email
                : ''}
            </span>
            <Link
              to="/"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Exit
            </Link>
            <button
              type="button"
              onClick={clearUser}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Log out
            </button>
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 p-3 mobile:p-4 tablet:p-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
