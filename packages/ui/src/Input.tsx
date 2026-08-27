import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Input — text input primitive (COMPONENT_LIBRARY_SPECIFICATION §1).
 * Variants: default, error, success. Sizes: sm, md, lg.
 */

export const inputVariants = cva(
  'w-full rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/20 hover:border-gray-300',
  {
    variants: {
      variant: {
        default: '',
        error:
          'border-red-500 ring-1 ring-red-500/20 focus-visible:border-red-500 focus-visible:ring-red-500/20',
        success:
          'border-green-500 ring-1 ring-green-500/20 focus-visible:border-green-500 focus-visible:ring-green-500/20',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-13 px-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Visual height variant (HTML `size` attribute is not supported). */
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
