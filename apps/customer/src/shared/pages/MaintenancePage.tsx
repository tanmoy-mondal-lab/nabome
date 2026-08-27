import { Wrench } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@nabome/ui';

/**
 * Maintenance page following ERROR_HANDLING_LOADING_STATES_USER_FEEDBACK_SPECIFICATION.md
 *
 * Features:
 * - Clear maintenance message
 * - Estimated completion time placeholder
 * - Accessible
 * - Consistent with design system
 */
export function MaintenancePage(): ReactNode {
  return (
    <div className="flex min-h-[calc(100dvh-16rem)] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--bg-info-subtle)">
          <Wrench className="h-10 w-10 text-(--text-info)" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            Under Maintenance
          </h1>
          <p className="text-sm text-(--text-secondary)">
            We're performing scheduled maintenance. We'll be back online
            shortly. Thank you for your patience.
          </p>
        </div>
        <div className="text-sm text-(--text-tertiary)">
          {/* Estimated completion can be configured dynamically */}
          <p>Expected to be back by: Soon</p>
        </div>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
