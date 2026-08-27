import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Container — responsive content container (COMPONENT_LIBRARY_SPECIFICATION §10).
 * Centers content with max-width and responsive padding.
 */

export const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      narrow: 'max-w-(--width-container-sm)',
      default: 'max-w-(--width-container-md)',
      wide: 'max-w-(--width-container-lg)',
      full: 'max-w-full',
    },
    padding: {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
    },
  },
  defaultVariants: {
    size: 'default',
    padding: 'md',
  },
});

export interface ContainerProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /** Container max-width */
  size?: 'narrow' | 'default' | 'wide' | 'full';
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size, padding }), className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Container.displayName = 'Container';
