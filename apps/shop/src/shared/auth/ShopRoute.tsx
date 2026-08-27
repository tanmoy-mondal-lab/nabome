import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * ShopRoute — admits shop owners and higher (additive hierarchy).
 * Others are redirected away (SEC §2.2).
 */
export function ShopRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isShopOwner = useAuthStore((state) => state.isShopOwner);
  const location = useLocation();

  if (!isAuthenticated || !isShopOwner()) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }
  return <Outlet />;
}
