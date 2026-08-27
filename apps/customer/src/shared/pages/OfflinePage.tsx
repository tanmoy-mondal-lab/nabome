import { WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@nabome/ui';

/**
 * Offline page following ERROR_HANDLING_LOADING_STATES_USER_FEEDBACK_SPECIFICATION.md
 *
 * Features:
 * - Clear offline message
 * - Retry action
 * - Accessible
 * - Consistent with design system
 */
export function OfflinePage(): ReactNode {
  return (
    <div className="flex min-h-[calc(100dvh-16rem)] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--bg-warning-subtle)">
          <WifiOff className="h-10 w-10 text-(--text-warning)" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            You're Offline
          </h1>
          <p className="text-sm text-(--text-secondary)">
            It looks like you've lost your internet connection. Please check
            your network and try again.
          </p>
        </div>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
