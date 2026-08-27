import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * ValidationMessage — inline validation feedback (COMPONENT_LIBRARY_SPECIFICATION §4).
 * Shows success, error, or warning messages for form fields.
 */

export const validationMessageVariants = cva('text-sm', {
  variants: {
    variant: {
      error: 'text-(--text-error)',
      success: 'text-(--text-success)',
      warning: 'text-(--text-warning)',
    },
  },
  defaultVariants: {
    variant: 'error',
  },
});

export interface ValidationMessageProps
  extends
    HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof validationMessageVariants> {
  /** Message variant */
  variant?: 'error' | 'success' | 'warning';
  /** Show icon */
  showIcon?: boolean;
}

export const ValidationMessage = forwardRef<
  HTMLParagraphElement,
  ValidationMessageProps
>(
  (
    { className, variant = 'error', showIcon = false, children, ...props },
    ref,
  ) => {
    const icons: Record<string, React.ReactNode> = {
      error: (
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      success: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      warning: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    };

    return (
      <p
        ref={ref}
        className={cn(
          'flex items-center gap-1.5',
          validationMessageVariants({ variant }),
          className,
        )}
        {...props}
      >
        {showIcon && <span>{icons[variant]}</span>}
        {children}
      </p>
    );
  },
);
ValidationMessage.displayName = 'ValidationMessage';
