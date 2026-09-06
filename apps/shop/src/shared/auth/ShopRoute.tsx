import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * ShopRoute — admits shop owners and higher (additive hierarchy).
 * Others are redirected away (SEC §2.2).
 */
export function ShopRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);
  const isShopOwner = useAuthStore((state) => state.isShopOwner);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div
        className="flex min-h-[50dvh] items-center justify-center"
        role="status"
        aria-label="Checking session"
      >
        <span className="text-sm">Loading…</span>
      </div>
    );
  }
  if (!isAuthenticated || !isShopOwner()) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }
  return <Outlet />;
}
