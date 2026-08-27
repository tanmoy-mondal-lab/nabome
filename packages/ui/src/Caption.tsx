import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Caption — small text for captions, helper text, metadata (COMPONENT_LIBRARY_SPECIFICATION §2).
 * Uses smallest readable font size with letter spacing for premium feel.
 */

export interface CaptionProps extends HTMLAttributes<HTMLElement> {
  /** Render as different element */
  as?: 'span' | 'div' | 'figcaption';
}

export const Caption = forwardRef<HTMLElement, CaptionProps>(
  ({ className, as = 'span', children, ...props }, ref) => {
    const asToTag = {
      span: 'span',
      div: 'div',
      figcaption: 'figcaption',
    } as const;

    const Tag = asToTag[as];

    return (
      <Tag
        ref={ref as any}
        className={cn(
          'text-xs font-medium tracking-wide text-(--text-tertiary) leading-loose',
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
Caption.displayName = 'Caption';
