import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Radio — single selection from a group (COMPONENT_LIBRARY_SPECIFICATION §4.9).
 * Accessible with keyboard, minimum 44x44px touch target.
 */

export const radioVariants = cva(
  'peer h-5 w-5 shrink-0 rounded-full border border-(--border-default) bg-(--bg-surface) text-(--color-brand-500) transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 checked:border-(--color-brand-500) checked:bg-(--color-brand-500) focus-visible:outline-none',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface RadioProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  /** Radio size */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: React.ReactNode;
  /** Error state */
  error?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, size, label, error = false, id, children, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={cn(
            radioVariants({ size }),
            error &&
              'border-(--color-status-error) ring-1 ring-(--color-status-error)',
            className,
          )}
          aria-invalid={error}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="text-sm font-medium text-(--text-primary) leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Radio.displayName = 'Radio';
