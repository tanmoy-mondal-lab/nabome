import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * ProtectedRoute — redirects guests to /login, preserving the destination
 * (ROUTING_NAVIGATION_USER_FLOW_SPECIFICATION §15.4). Single wrapper; never
 * nest multiple guards around the same route.
 */
export function ProtectedRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div
        className="flex min-h-[50dvh] items-center justify-center"
        role="status"
        aria-label="Checking session"
      >
        <span className="text-sm text-(--text-tertiary)">Loading…</span>
      </div>
    );
  }
  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }
  return <Outlet />;
}
