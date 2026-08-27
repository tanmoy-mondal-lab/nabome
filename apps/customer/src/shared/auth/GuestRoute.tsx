import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

import { useAuthStore } from '@/stores/auth-store';

/**
 * GuestRoute — redirects authenticated users away from auth pages
 * (login/register) back to the homepage (ROUTING spec §15.4).
 */
export function GuestRoute(): ReactNode {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
