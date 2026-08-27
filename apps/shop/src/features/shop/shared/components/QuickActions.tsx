/**
 * Quick Actions Component
 *
 * Displays quick action buttons for common shop operations
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.7
 */

import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { Button } from '@nabome/ui';
import { cn } from '@nabome/utils';

import type { QuickAction } from '../types';

export interface QuickActionsProps extends HTMLAttributes<HTMLDivElement> {
  actions: QuickAction[];
  variant?: 'desktop' | 'mobile';
}

export const QuickActions = forwardRef<HTMLDivElement, QuickActionsProps>(
  ({ actions, variant = 'desktop', className, ...props }, ref) => {
    if (variant === 'mobile') {
      // Mobile: Floating action button
      const primaryAction = actions[0];
      const PrimaryIcon = primaryAction?.icon;
      return (
        <div
          ref={ref}
          className={cn('fixed bottom-20 right-4 z-50', className)}
          {...props}
        >
          <Button
            variant="primary"
            size="lg"
            className="rounded-full shadow-lg"
            onClick={primaryAction?.action}
          >
            {PrimaryIcon && (
              <div className="text-(--text-primary)">
                <PrimaryIcon />
              </div>
            )}
          </Button>
        </div>
      );
    }

    // Desktop: Horizontal action bar
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.id}
              variant="secondary"
              size="md"
              onClick={action.action}
              className="flex items-center gap-2"
            >
              {IconComponent && (
                <div className="text-(--text-secondary)">
                  <IconComponent />
                </div>
              )}
              <span>{action.label}</span>
              {action.shortcut && (
                <span className="text-xs text-(--text-tertiary) ml-2">
                  {action.shortcut}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    );
  },
);

QuickActions.displayName = 'QuickActions';
