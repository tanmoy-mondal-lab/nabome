import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

/**
 * Bottom Navigation component following NAVIGATION_ARCHITECTURE.md
 *
 * Features:
 * - Mobile-first bottom navigation
 * - Hidden on desktop (where header navigation is used)
 * - Active state indication
 * - Tap targets meeting minimum size (44px)
 * - Accessible with proper ARIA labels
 */
export function BottomNavigation(): ReactNode {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    { to: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-(--z-sticky) border-t border-(--border-default) bg-(--bg-surface) pb-[env(safe-area-inset-bottom)] desktop:hidden"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 tap-target"
            aria-label={item.label}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-6 w-6 transition-colors ${
                    isActive ? 'text-(--text-brand)' : 'text-(--text-tertiary)'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-(--text-brand)' : 'text-(--text-tertiary)'
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
