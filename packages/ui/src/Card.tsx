import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Card — surface container primitive (COMPONENT_LIBRARY_SPECIFICATION §1).
 * Paddings: none, sm, md, lg. `interactive` adds hover elevation; `elevated`
 * uses the elevated shadow token.
 */

export const cardVariants = cva(
  'rounded-xl border border-(--card-border) bg-(--card-bg) text-(--card-text)',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      elevated: {
        true: 'shadow-(--shadow-card)',
      },
      interactive: {
        true: 'transition-all duration-(--duration-fast) ease-(--ease-luxe-out) hover:shadow-(--shadow-elevated) hover:border-(--border-strong)',
      },
    },
    defaultVariants: {
      padding: 'md',
      elevated: false,
      interactive: false,
    },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, elevated, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ padding, elevated, interactive }),
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';
