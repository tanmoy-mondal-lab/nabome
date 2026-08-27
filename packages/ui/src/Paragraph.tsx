import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Paragraph — semantic paragraph with proper spacing (COMPONENT_LIBRARY_SPECIFICATION §2).
 * Uses body text styles with appropriate line height for readability.
 */

export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Lead paragraph for emphasis */
  lead?: boolean;
}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, lead = false, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-base leading-body text-(--text-primary)',
          lead && 'text-lg leading-relaxed text-(--text-secondary)',
          className,
        )}
        {...props}
      >
        {children}
      </p>
    );
  },
);
Paragraph.displayName = 'Paragraph';
