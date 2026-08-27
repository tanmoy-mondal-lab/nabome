import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Chip — compact tag for categories, filters, selections (COMPONENT_LIBRARY_SPECIFICATION §10).
 * Removable with close button. Multiple color variants.
 */

export const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors duration-(--duration-fast) ease-(--ease-default)',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-neutral-100) text-(--text-secondary) hover:bg-(--color-neutral-200)',
        primary:
          'bg-(--color-brand-100) text-(--color-brand-700) hover:bg-(--color-brand-200)',
        success:
          'bg-(--color-status-success-light) text-(--color-status-success-dark) hover:bg-(--color-status-success-light)',
        warning:
          'bg-(--color-status-warning-light) text-(--color-status-warning-dark) hover:bg-(--color-status-warning-light)',
        error:
          'bg-(--color-status-error-light) text-(--color-status-error-dark) hover:bg-(--color-status-error-light)',
        gold: 'bg-(--color-accent-gold-light) text-(--color-accent-gold-dark) hover:bg-(--color-accent-gold)',
        outline:
          'border border-(--border-default) text-(--text-secondary) hover:border-(--border-strong)',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ChipProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof chipVariants> {
  /** Chip variant */
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'gold'
    | 'outline';
  /** Chip size */
  size?: 'sm' | 'md' | 'lg';
  /** Show close button */
  removable?: boolean;
  /** Close callback */
  onRemove?: () => void;
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className,
      variant,
      size,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)"
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
Chip.displayName = 'Chip';
