import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Skeleton — loading placeholder primitive (pulse animation, reduced-motion
 * safe via the `motion-safe:` variant).
 */

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Rounded corners: none | sm | md | lg | full (default md). */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, radius = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          'animate-pulse bg-(--color-neutral-200) motion-safe:animate-pulse',
          radius === 'none' && 'rounded-none',
          radius === 'sm' && 'rounded-sm',
          radius === 'md' && 'rounded-md',
          radius === 'lg' && 'rounded-lg',
          radius === 'full' && 'rounded-full',
          className,
        )}
        {...props}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';
