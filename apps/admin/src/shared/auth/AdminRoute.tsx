import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * AdminRoute — admits only platform admins (additive hierarchy: admin or
 * system). Others are redirected to the public site (SEC §2.2).
 */
export function AdminRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const location = useLocation();

  if (!isAuthenticated || !isAdmin()) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }
  return <Outlet />;
}
