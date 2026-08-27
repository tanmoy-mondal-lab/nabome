import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Progress — linear progress indicator (COMPONENT_LIBRARY_SPECIFICATION §5.6).
 * Shows completion percentage. Accessible with aria-valuenow.
 */

export const progressVariants = cva(
  'h-2 w-full overflow-hidden rounded-full bg-(--color-neutral-200)',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface ProgressProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /** Progress size */
  size?: 'sm' | 'md' | 'lg';
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, size, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(progressVariants({ size }), className)}
        {...props}
      >
        <div
          className="h-full rounded-full bg-(--color-brand-500) transition-all duration-(--duration-normal) ease-(--ease-default)"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';
