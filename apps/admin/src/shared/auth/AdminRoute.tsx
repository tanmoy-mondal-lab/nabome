import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * AdminRoute — admits only platform admins (additive hierarchy: admin or
 * system). Others are redirected to the public site (SEC §2.2).
 */
export function AdminRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);
  const isAdmin = useAuthStore((state) => state.isAdmin);
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
  if (!isAuthenticated || !isAdmin()) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }
  return <Outlet />;
}
