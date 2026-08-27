import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { useState } from 'react';

import { cn } from '@nabome/utils';

/**
 * Tooltip — contextual information on hover (COMPONENT_LIBRARY_SPECIFICATION §12).
 * Accessible with keyboard focus. Positioned relative to trigger.
 */

export const tooltipVariants = cva(
  'absolute z-(--z-tooltip) rounded-md bg-(--color-neutral-900) px-2 py-1 text-xs text-white shadow-(--shadow-card) transition-opacity duration-(--duration-fast) ease-(--ease-default)',
  {
    variants: {
      open: {
        true: 'opacity-100',
        false: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  /** Tooltip content */
  content: string;
  /** Tooltip children (trigger) */
  children: React.ReactNode;
  /** Tooltip position */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, children, position = 'top', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        {...props}
      >
        {children}
        <div
          className={cn(
            tooltipVariants({ open: isOpen }),
            positionClasses[position],
          )}
          role="tooltip"
        >
          {content}
        </div>
      </div>
    );
  },
);
Tooltip.displayName = 'Tooltip';
