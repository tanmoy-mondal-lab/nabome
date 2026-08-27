import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Button — the canonical action primitive (COMPONENT_LIBRARY_SPECIFICATION §1).
 * Variants: primary, secondary, ghost, outline, gold, danger. Sizes: sm, md, lg.
 * Colors reference component tokens (--button-*) so dark theme works automatically.
 */

export const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold outline-none transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:shadow-md active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30',
        secondary:
          'bg-white text-gray-900 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50',
        ghost:
          'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-indigo-600',
        outline:
          'bg-transparent text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50',
        gold: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:from-amber-500 hover:to-yellow-600 shadow-lg shadow-amber-500/30',
        danger:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables the button. */
  isLoading?: boolean;
  /** Stretches to the full width of the container. */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      fullWidth = false,
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
