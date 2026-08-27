import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Textarea — multi-line text input (COMPONENT_LIBRARY_SPECIFICATION §4.15).
 * Auto-resize capability, character count support.
 */

export const textareaVariants = cva(
  'w-full rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-(--input-text) placeholder:text-(--input-placeholder) outline-none transition-colors duration-(--duration-fast) focus-visible:border-(--input-border-focus) focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-(--input-border-error) aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-(--shadow-focus-error) resize-none',
  {
    variants: {
      variant: {
        default: '',
        error:
          'border-(--input-border-error) ring-1 ring-(--shadow-focus-error)',
        success: 'border-(--border-success)',
      },
      size: {
        sm: 'h-20 text-sm',
        md: 'h-32 text-base',
        lg: 'h-48 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface TextareaProps
  extends
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Visual height variant */
  size?: 'sm' | 'md' | 'lg';
  /** Auto-resize with content */
  autoResize?: boolean;
  /** Maximum characters */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Current character count */
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      autoResize = false,
      maxLength,
      showCount = false,
      currentLength = 0,
      id,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(textareaVariants({ variant, size }), className)}
          maxLength={maxLength}
          {...props}
        />
        {showCount && maxLength && (
          <div className="flex justify-end">
            <span className="text-xs text-(--text-tertiary)">
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
