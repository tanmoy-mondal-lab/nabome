import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * GuestRoute — redirects authenticated users away from auth pages
 * (login/register) back to the homepage (ROUTING spec §15.4).
 */
export function GuestRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);

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
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
