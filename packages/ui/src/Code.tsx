import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Code — inline code and code blocks (COMPONENT_LIBRARY_SPECIFICATION §2).
 * Uses monospace font with subtle background for inline, styled block for code blocks.
 */

export const codeVariants = cva('font-mono text-sm', {
  variants: {
    variant: {
      inline:
        'rounded bg-(--color-neutral-100) px-1.5 py-0.5 text-(--text-primary)',
      block:
        'block rounded-lg bg-(--color-neutral-900) p-4 text-(--text-on-dark) sm:p-6',
    },
  },
  defaultVariants: {
    variant: 'inline',
  },
});

export interface CodeProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof codeVariants> {
  /** Code variant */
  variant?: 'inline' | 'block';
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ className, variant = 'inline', children, ...props }, ref) => {
    if (variant === 'block') {
      return (
        <pre
          ref={ref as React.Ref<HTMLPreElement>}
          className={cn(codeVariants({ variant }), className)}
          {...props}
        >
          <code>{children}</code>
        </pre>
      );
    }

    return (
      <code
        ref={ref as React.Ref<HTMLElement>}
        className={cn(codeVariants({ variant }), className)}
        {...props}
      >
        {children}
      </code>
    );
  },
);
Code.displayName = 'Code';
