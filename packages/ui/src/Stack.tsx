import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Stack — flex container for vertical/horizontal layouts (COMPONENT_LIBRARY_SPECIFICATION §10).
 * Provides consistent spacing between children.
 */

export const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    align: 'start',
    justify: 'start',
    gap: 'md',
    wrap: 'nowrap',
  },
});

export interface StackProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Cross-axis alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Main-axis alignment */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Gap between items */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Flex wrap behavior */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    { className, direction, align, justify, gap, wrap, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          stackVariants({ direction, align, justify, gap, wrap }),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Stack.displayName = 'Stack';
