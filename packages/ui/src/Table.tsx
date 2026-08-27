import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Table — data table component (COMPONENT_LIBRARY_SPECIFICATION §9).
 * Responsive, accessible, with hover states and borders.
 */

export const tableVariants = cva('w-full border-collapse', {
  variants: {
    variant: {
      default: '',
      bordered: 'border border-(--border-default)',
      striped: 'border border-(--border-default)',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface TableProps
  extends HTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {
  /** Table variant */
  variant?: 'default' | 'bordered' | 'striped';
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn(tableVariants({ variant }), className)}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
);
Table.displayName = 'Table';

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn('bg-(--color-neutral-50)', className)}
      {...props}
    >
      {children}
    </thead>
  );
});
TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      >
        {children}
      </tbody>
    );
  },
);
TableBody.displayName = 'TableBody';

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-(--border-default) transition-colors hover:bg-(--color-neutral-50)',
          className,
        )}
        {...props}
      >
        {children}
      </tr>
    );
  },
);
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--text-secondary)',
          className,
        )}
        {...props}
      >
        {children}
      </th>
    );
  },
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('px-4 py-3 text-sm text-(--text-primary)', className)}
        {...props}
      >
        {children}
      </td>
    );
  },
);
TableCell.displayName = 'TableCell';
