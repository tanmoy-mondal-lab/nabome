import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Pagination — page navigation for data tables (COMPONENT_LIBRARY_SPECIFICATION §9).
 * Previous/Next buttons and page numbers. Accessible with keyboard.
 */

export const paginationVariants = cva('flex items-center gap-2', {
  variants: {},
  defaultVariants: {},
});

export const paginationButtonVariants = cva(
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'text-(--text-secondary) hover:bg-(--color-neutral-100)',
        active: 'bg-(--color-brand-500) text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface PaginationProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof paginationVariants> {
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Page change callback */
  onPageChange: (page: number) => void;
  /** Show page numbers */
  showPageNumbers?: boolean;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      showPageNumbers = true,
      ...props
    },
    ref,
  ) => {
    const pages = [];
    const maxVisible = 5;

    if (showPageNumbers) {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return (
      <nav
        ref={ref as any}
        aria-label="Pagination"
        className={cn(paginationVariants(), className)}
        {...props}
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(paginationButtonVariants({ variant: 'default' }))}
          aria-label="Previous page"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  paginationButtonVariants({
                    variant: page === currentPage ? 'active' : 'default',
                  }),
                )}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(paginationButtonVariants({ variant: 'default' }))}
          aria-label="Next page"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </nav>
    );
  },
);
Pagination.displayName = 'Pagination';
