import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Link — styled anchor component (COMPONENT_LIBRARY_SPECIFICATION §2).
 * Uses brand color with hover states. Accessible with focus rings.
 */

export const linkVariants = cva(
  'inline-flex items-center gap-1.5 font-medium outline-none transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        default:
          'text-(--text-brand) hover:text-(--text-brand-hover) underline-offset-4 hover:underline',
        muted:
          'text-(--text-secondary) hover:text-(--text-primary) underline-offset-4 hover:underline',
        ghost:
          'text-(--text-secondary) hover:text-(--text-brand) hover:bg-(--interactive-ghost-hover)',
        button:
          'rounded-md px-3 py-1.5 text-(--text-brand) hover:bg-(--color-brand-50)',
      },
      size: {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  },
);

export interface LinkProps
  extends
    AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /** Link variant style */
  variant?: 'default' | 'muted' | 'ghost' | 'button';
  /** Link size */
  size?: 'sm' | 'base' | 'lg';
  /** External link indicator */
  external?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, external = false, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(linkVariants({ variant, size }), className)}
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
        {external && (
          <span className="inline-block" aria-hidden="true">
            ↗
          </span>
        )}
      </a>
    );
  },
);
Link.displayName = 'Link';
