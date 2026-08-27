import { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Label — form label primitive. HTML label semantics with typography tokens.
 */

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Visually hides the label while keeping it accessible (sr-only). */
  srOnly?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, srOnly = false, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium text-(--text-primary)',
          srOnly && 'sr-only',
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = 'Label';
