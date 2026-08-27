import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Divider — visual separator (COMPONENT_LIBRARY_SPECIFICATION §2).
 * Horizontal or vertical divider with optional label.
 */

export const dividerVariants = cva('border-(--border-default)', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l',
    },
    variant: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
  },
});

export interface DividerProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof dividerVariants> {
  /** Divider orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Border style */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** Optional label */
  label?: string;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation, variant, label, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-4', className)}
          {...props}
        >
          <div
            className={cn(
              dividerVariants({ orientation: 'horizontal', variant }),
            )}
          />
          <span className="text-sm text-(--text-tertiary)">{label}</span>
          <div
            className={cn(
              dividerVariants({ orientation: 'horizontal', variant }),
            )}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(dividerVariants({ orientation, variant }), className)}
        {...props}
      />
    );
  },
);
Divider.displayName = 'Divider';
