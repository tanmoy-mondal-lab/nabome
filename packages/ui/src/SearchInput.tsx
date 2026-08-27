import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * SearchInput — search field with icon (COMPONENT_LIBRARY_SPECIFICATION §4.4).
 * Includes search icon and clear button. Accessible with keyboard.
 */

export const searchInputVariants = cva(
  'w-full rounded-md border border-(--input-border) bg-(--input-bg) pl-10 pr-10 text-(--input-text) placeholder:text-(--input-placeholder) outline-none transition-colors duration-(--duration-fast) focus-visible:border-(--input-border-focus) focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      size: {
        sm: 'h-8 text-sm',
        md: 'h-10 text-base',
        lg: 'h-12 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface SearchInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchInputVariants> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Show clear button */
  showClear?: boolean;
  /** Clear callback */
  onClear?: () => void;
  /** Has value */
  hasValue?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { className, size, showClear = false, onClear, hasValue = false, ...props },
    ref,
  ) => {
    return (
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-muted)"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={ref}
          type="search"
          className={cn(searchInputVariants({ size }), className)}
          {...props}
        />
        {showClear && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-(--text-muted) hover:bg-(--color-neutral-100) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
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
SearchInput.displayName = 'SearchInput';
