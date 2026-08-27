import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Switch — toggle between two states (COMPONENT_LIBRARY_SPECIFICATION §4.11).
 * Label on left, switch on right. Accessible with keyboard.
 */

export const switchVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-(--color-neutral-200) transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 checked:bg-(--color-brand-500)',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-13',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow ring-0 transition-transform duration-(--duration-fast) ease-(--ease-default)',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 translate-x-0 data-[state=checked]:translate-x-4',
        md: 'h-5 w-5 translate-x-0 data-[state=checked]:translate-x-5',
        lg: 'h-6 w-6 translate-x-0 data-[state=checked]:translate-x-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface SwitchProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof switchVariants> {
  /** Switch size */
  size?: 'sm' | 'md' | 'lg';
  /** Label text */
  label?: string;
  /** Error state */
  error?: boolean;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, size, label, error = false, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-3">
        {label && (
          <label
            htmlFor={switchId}
            className="text-sm font-medium text-(--text-primary) cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
          >
            {label}
          </label>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={props.checked}
          aria-invalid={error}
          className={cn(
            switchVariants({ size }),
            error &&
              'border-(--color-status-error) ring-1 ring-(--color-status-error)',
            className,
          )}
          onClick={() => {
            // Toggle handled by hidden input
          }}
        >
          <span
            data-state={props.checked ? 'checked' : 'unchecked'}
            className={cn(switchThumbVariants({ size }))}
          />
        </button>
        <input
          ref={ref}
          id={switchId}
          type="checkbox"
          className="sr-only"
          {...props}
        />
      </div>
    );
  },
);
Switch.displayName = 'Switch';
