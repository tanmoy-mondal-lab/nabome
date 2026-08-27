import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * EmptyState — placeholder for empty content (COMPONENT_LIBRARY_SPECIFICATION §5.5).
 * Icon, title, description, and optional action button.
 */

export const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center p-8',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-8',
        lg: 'p-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface EmptyStateProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /** Empty state size */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, size, icon, title, description, action, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ size }), className)}
        {...props}
      >
        {icon && <div className="mb-4 text-(--text-muted)">{icon}</div>}
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
EmptyState.displayName = 'EmptyState';
