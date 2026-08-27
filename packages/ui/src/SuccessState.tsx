import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * SuccessState — success feedback display (COMPONENT_LIBRARY_SPECIFICATION §5.5).
 * Icon, title, description, and optional action button.
 */

export interface SuccessStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Success title */
  title?: string;
  /** Success description */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
}

export const SuccessState = forwardRef<HTMLDivElement, SuccessStateProps>(
  ({ className, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center p-8',
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-status-success-light)">
          <svg
            className="h-8 w-8 text-(--color-status-success-dark)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        {title && (
          <h3 className="text-lg font-semibold text-(--text-primary) mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-(--text-secondary) mb-6 max-w-sm">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
        {children}
      </div>
    );
  },
);
SuccessState.displayName = 'SuccessState';
