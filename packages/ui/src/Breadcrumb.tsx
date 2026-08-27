import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Breadcrumb — navigation path indicator (COMPONENT_LIBRARY_SPECIFICATION §11).
 * Shows current location with clickable path segments.
 */

export const breadcrumbVariants = cva('flex items-center gap-2 text-sm', {
  variants: {},
  defaultVariants: {},
});

export interface BreadcrumbProps
  extends
    HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref as any}
        aria-label="Breadcrumb"
        className={cn(breadcrumbVariants(), className)}
        {...props}
      >
        <ol className="flex items-center gap-2">{children}</ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = 'Breadcrumb';

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {children}
      </li>
    );
  },
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

export interface BreadcrumbLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Current page indicator */
  current?: boolean;
}

export const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ className, current = false, children, ...props }, ref) => {
  if (current) {
    return (
      <span
        className={cn('text-(--text-primary) font-medium', className)}
        aria-current="page"
      >
        {children}
      </span>
    );
  }

  return (
    <a
      ref={ref}
      className={cn(
        'text-(--text-secondary) hover:text-(--text-primary) transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

export const BreadcrumbSeparator = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn('text-(--text-muted)', className)}
      aria-hidden="true"
      {...props}
    >
      /
    </span>
  );
});
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
