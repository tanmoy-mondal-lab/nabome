import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * IconButton — button with only an icon (COMPONENT_LIBRARY_SPECIFICATION §3.2).
 * Accessible with aria-label. Minimum 44x44px touch target.
 */

export const iconButtonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center rounded-md outline-none transition-colors duration-(--duration-fast) ease-(--ease-default) disabled:pointer-events-none disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary:
          'bg-(--button-primary-bg) text-(--button-primary-text) hover:bg-(--button-primary-bg-hover)',
        ghost:
          'bg-transparent text-(--text-secondary) hover:bg-(--interactive-ghost-hover) hover:text-(--text-primary)',
        outline:
          'bg-transparent text-(--text-secondary) border border-(--border-default) hover:bg-(--interactive-outline-hover)',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

export interface IconButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Icon to display */
  icon: React.ReactNode;
  /** Accessible label (required) */
  'aria-label': string;
  /** Button variant */
  variant?: 'primary' | 'ghost' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          <span className="flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
