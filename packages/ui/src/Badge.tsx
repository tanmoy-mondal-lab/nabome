import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Badge — status label primitive. Variants map to status/brand component
 * tokens: success, warning, error, info, brand, gold, neutral, outline.
 */

export const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        success: 'bg-(--badge-success-bg) text-(--badge-success-text)',
        warning: 'bg-(--badge-warning-bg) text-(--badge-warning-text)',
        error: 'bg-(--badge-error-bg) text-(--badge-error-text)',
        info: 'bg-(--badge-info-bg) text-(--badge-info-text)',
        brand: 'bg-(--badge-brand-bg) text-(--badge-brand-text)',
        gold: 'bg-(--badge-gold-bg) text-(--badge-gold-text)',
        neutral: 'bg-(--color-neutral-100) text-(--color-neutral-700)',
        outline:
          'border border-(--border-default) bg-transparent text-(--text-secondary)',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';
