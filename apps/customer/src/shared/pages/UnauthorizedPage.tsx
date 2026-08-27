import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@nabome/ui';

/**
 * 401 Unauthorized page following ERROR_HANDLING_LOADING_STATES_USER_FEEDBACK_SPECIFICATION.md
 *
 * Features:
 * - Clear error message
 * - Call to action (login)
 * - Accessible
 * - Consistent with design system
 */
export function UnauthorizedPage(): ReactNode {
  return (
    <div className="flex min-h-[calc(100dvh-16rem)] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--bg-warning-subtle)">
          <Lock className="h-10 w-10 text-(--text-warning)" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            Unauthorized
          </h1>
          <p className="text-sm text-(--text-secondary)">
            You need to sign in to access this page. Please log in to continue.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
