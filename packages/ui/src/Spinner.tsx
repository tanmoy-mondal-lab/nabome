import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Spinner — loading indicator primitive. Sizes: xs, sm, md, lg.
 * For standalone use; Button renders its own inline spinner.
 */

export const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-(--color-neutral-300) border-t-(--color-brand-500)',
  {
    variants: {
      size: {
        xs: 'size-3',
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface SpinnerProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = 'Loading…', ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        <span aria-hidden="true" className={spinnerVariants({ size })} />
        <span className="sr-only">{label}</span>
      </span>
    );
  },
);
Spinner.displayName = 'Spinner';
