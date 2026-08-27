import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Text — body text and paragraph component (COMPONENT_LIBRARY_SPECIFICATION §2).
 * Uses Manrope font family with appropriate line heights for readability.
 */

export const textVariants = cva(
  'font-normal leading-body text-(--text-primary)',
  {
    variants: {
      size: {
        xs: 'text-(--text-xs)',
        sm: 'text-(--text-sm)',
        base: 'text-(--text-base)',
        lg: 'text-(--text-lg)',
        xl: 'text-(--text-xl)',
      },
      weight: {
        light: 'font-light',
        regular: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      color: {
        primary: 'text-(--text-primary)',
        secondary: 'text-(--text-secondary)',
        tertiary: 'text-(--text-tertiary)',
        muted: 'text-(--text-muted)',
        brand: 'text-(--text-brand)',
        error: 'text-(--text-error)',
        success: 'text-(--text-success)',
        warning: 'text-(--text-warning)',
        info: 'text-(--text-info)',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'regular',
      color: 'primary',
      align: 'left',
    },
  },
);

export interface TextProps
  extends
    HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  /** Text size variant */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  /** Font weight */
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'muted'
    | 'brand'
    | 'error'
    | 'success'
    | 'warning'
    | 'info';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Render as different element */
  as?: 'p' | 'span' | 'div';
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    { className, size, weight, color, align, as = 'p', children, ...props },
    ref,
  ) => {
    const asToTag = {
      p: 'p',
      span: 'span',
      div: 'div',
    } as const;

    const Tag = asToTag[as];

    return (
      <Tag
        ref={ref}
        className={cn(textVariants({ size, weight, color, align }), className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
Text.displayName = 'Text';
