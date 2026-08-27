import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * FileUpload — file input with drag and drop (COMPONENT_LIBRARY_SPECIFICATION §13).
 * Supports drag and drop, multiple files, and file type validation.
 */

export const fileUploadVariants = cva(
  'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors duration-(--duration-fast) ease-(--ease-default)',
  {
    variants: {
      variant: {
        default:
          'border-(--border-default) hover:border-(--border-strong) hover:bg-(--color-neutral-50)',
        error: 'border-(--color-status-error) bg-(--color-status-error-light)',
        success:
          'border-(--color-status-success) bg-(--color-status-success-light)',
      },
      size: {
        sm: 'p-4',
        md: 'p-8',
        lg: 'p-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface FileUploadProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof fileUploadVariants> {
  /** Upload variant */
  variant?: 'default' | 'error' | 'success';
  /** Upload size */
  size?: 'sm' | 'md' | 'lg';
  /** Upload label */
  label?: string;
  /** Upload description */
  description?: string;
  /** Accepted file types */
  accept?: string;
  /** Multiple files */
  multiple?: boolean;
  /** Drag state */
  isDragging?: boolean;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      variant,
      size,
      label,
      description,
      accept,
      multiple = false,
      isDragging = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          fileUploadVariants({ variant, size }),
          isDragging && 'border-(--color-brand-500) bg-(--color-brand-50)',
          className,
        )}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          multiple={multiple}
          className="absolute inset-0 cursor-pointer opacity-0"
          {...props}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <svg
            className="h-10 w-10 text-(--text-muted)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {label && (
            <p className="text-sm font-medium text-(--text-primary)">{label}</p>
          )}
          {description && (
            <p className="text-xs text-(--text-secondary)">{description}</p>
          )}
        </div>
      </div>
    );
  },
);
FileUpload.displayName = 'FileUpload';
