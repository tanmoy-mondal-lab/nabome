import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Heading — display and section headings (COMPONENT_LIBRARY_SPECIFICATION §2).
 * H1/H2 use Cormorant Garamond (display font), H3+ use Manrope (body font).
 * Responsive typography: scales with viewport.
 */

export const headingVariants = cva(
  'font-semibold tracking-normal text-(--text-primary)',
  {
    variants: {
      level: {
        h1: 'font-display font-light text-(--text-5xl) tracking-tighter leading-tight sm:text-(--text-5xl)',
        h2: 'font-display text-(--text-4xl) tracking-tight leading-snug sm:text-(--text-4xl)',
        h3: 'text-(--text-2xl) leading-normal',
        h4: 'text-(--text-xl) leading-relaxed',
        h5: 'text-(--text-lg) leading-relaxed',
        h6: 'text-(--text-base) leading-relaxed',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      level: 'h3',
      align: 'left',
    },
  },
);

export interface HeadingProps
  extends
    HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  /** Heading level (h1-h6) */
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h3', align = 'left', children, ...props }, ref) => {
    const levelToTag = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
    } as const;

    const Tag = levelToTag[level];

    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ level, align }), className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
Heading.displayName = 'Heading';
