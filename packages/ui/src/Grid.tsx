import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Grid — responsive grid layout (COMPONENT_LIBRARY_SPECIFICATION §9).
 * Mobile-first responsive grid with configurable columns and gaps.
 */

export const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    colsSm: {
      1: 'sm:grid-cols-1',
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
      6: 'sm:grid-cols-6',
      8: 'sm:grid-cols-8',
      12: 'sm:grid-cols-12',
    },
    colsMd: {
      1: 'md:grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      6: 'md:grid-cols-6',
      8: 'md:grid-cols-8',
      12: 'md:grid-cols-12',
    },
    colsLg: {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      6: 'lg:grid-cols-6',
      8: 'lg:grid-cols-8',
      12: 'lg:grid-cols-12',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: {
    cols: 1,
    colsSm: 2,
    colsMd: 4,
    colsLg: 12,
    gap: 'md',
  },
});

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {
  /** Base columns (mobile) */
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Small breakpoint columns */
  colsSm?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  /** Medium breakpoint columns */
  colsMd?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  /** Large breakpoint columns */
  colsLg?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  /** Grid gap */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    { className, cols, colsSm, colsMd, colsLg, gap, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ cols, colsSm, colsMd, colsLg, gap }),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Grid.displayName = 'Grid';
