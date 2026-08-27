import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Select — dropdown selection (COMPONENT_LIBRARY_SPECIFICATION §4.7).
 * Custom dropdown for consistent styling, keyboard accessible.
 */

export const selectVariants = cva(
  'w-full appearance-none rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-(--input-text) outline-none transition-colors duration-(--duration-fast) focus-visible:border-(--input-border-focus) focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-(--input-border-error) aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-(--shadow-focus-error)',
  {
    variants: {
      variant: {
        default: '',
        error:
          'border-(--input-border-error) ring-1 ring-(--shadow-focus-error)',
        success: 'border-(--border-success)',
      },
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-base',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface SelectProps
  extends
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /** Visual height variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Options array */
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      options,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-(--text-primary)"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(selectVariants({ variant, size }), 'pr-8', className)}
            aria-invalid={!!error}
            aria-describedby={cn(errorId, helperId)}
            {...props}
          >
            {options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-(--text-muted)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} className="text-sm text-(--text-error)">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-(--text-tertiary)">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
