import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Alert — contextual feedback message (COMPONENT_LIBRARY_SPECIFICATION §5.2).
 * Info, success, warning, error variants with icons. Dismissible.
 */

export const alertVariants = cva(
  'flex items-start gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        info: 'border-(--color-status-info) bg-(--color-status-info-light) text-(--color-status-info-dark)',
        success:
          'border-(--color-status-success) bg-(--color-status-success-light) text-(--color-status-success-dark)',
        warning:
          'border-(--color-status-warning) bg-(--color-status-warning-light) text-(--color-status-warning-dark)',
        error:
          'border-(--color-status-error) bg-(--color-status-error-light) text-(--color-status-error-dark)',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Alert title */
  title?: string;
  /** Show close button */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
}

const icons = {
  info: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg
      className="h-5 w-5"
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
  ),
  warning: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      title,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref,
  ) => {
    const icon = icons[variant as keyof typeof icons];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="shrink-0">{icon}</div>
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className="mt-1">{children}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md p-1 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
Alert.displayName = 'Alert';
