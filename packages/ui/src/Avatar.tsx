import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Avatar — user profile image or initials (COMPONENT_LIBRARY_SPECIFICATION §10).
 * Circular with fallback to initials. Multiple sizes available.
 */

export const avatarVariants = cva(
  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--color-neutral-200) font-medium text-(--text-primary)',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface AvatarProps
  extends
    Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'>,
    VariantProps<typeof avatarVariants> {
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Fallback initials */
  initials?: string;
  /** Alt text for accessibility */
  alt?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, initials, alt, src, ...props }, ref) => {
    if (src) {
      return (
        <img
          ref={ref as any}
          src={src}
          alt={alt || 'Avatar'}
          className={cn(avatarVariants({ size }), 'object-cover', className)}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
        aria-label={alt || 'Avatar'}
      >
        {initials}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';
