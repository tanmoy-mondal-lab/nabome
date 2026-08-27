import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Image — responsive image with lazy loading (COMPONENT_LIBRARY_SPECIFICATION §13).
 * Includes object-fit, rounded corners, and accessibility support.
 */

export const imageVariants = cva('block w-full', {
  variants: {
    fit: {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    fit: 'cover',
    rounded: 'md',
  },
});

export interface ImageProps
  extends
    ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof imageVariants> {
  /** Object fit variant */
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Border radius variant */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Fallback background color */
  fallback?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      fit,
      rounded,
      fallback = 'bg-(--color-neutral-200)',
      ...props
    },
    ref,
  ) => {
    return (
      <img
        ref={ref}
        className={cn(imageVariants({ fit, rounded }), fallback, className)}
        loading="lazy"
        {...props}
      />
    );
  },
);
Image.displayName = 'Image';
