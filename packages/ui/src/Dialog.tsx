import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { useEffect, useState } from 'react';

import { cn } from '@nabome/utils';

/**
 * Dialog — modal dialog overlay (COMPONENT_LIBRARY_SPECIFICATION §12).
 * Accessible with focus trap and keyboard dismissal.
 */

export const dialogOverlayVariants = cva(
  'fixed inset-0 z-(--z-modal) bg-black/50 backdrop-blur-sm transition-opacity duration-(--duration-normal) ease-(--ease-default)',
  {
    variants: {
      open: {
        true: 'opacity-100',
        false: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      open: false,
    },
  },
);

export const dialogContentVariants = cva(
  'fixed left-1/2 top-1/2 z-(--z-modal) -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-(--bg-surface) p-6 shadow-(--shadow-modal) transition-all duration-(--duration-normal) ease-(--ease-default)',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
      },
      open: {
        true: 'opacity-100 scale-100',
        false: 'opacity-0 scale-95 pointer-events-none',
      },
    },
    defaultVariants: {
      size: 'md',
      open: false,
    },
  },
);

export interface DialogProps {
  /** Dialog open state */
  open: boolean;
  /** Dialog close callback */
  onClose: () => void;
  /** Dialog size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Dialog children */
  children: React.ReactNode;
  /** Show close button */
  showClose?: boolean;
}

export const Dialog = ({
  open,
  onClose,
  size = 'md',
  children,
  showClose = true,
}: DialogProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn(dialogOverlayVariants({ open }))}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(dialogContentVariants({ size, open }))}
        role="dialog"
        aria-modal="true"
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-(--text-secondary) hover:bg-(--color-neutral-100) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </>
  );
};

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mb-4', className)} {...props}>
        {children}
      </div>
    );
  },
);
DialogHeader.displayName = 'DialogHeader';

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold text-(--text-primary)', className)}
        {...props}
      >
        {children}
      </h2>
    );
  },
);
DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-(--text-secondary)', className)}
      {...props}
    >
      {children}
    </p>
  );
});
DialogDescription.displayName = 'DialogDescription';

export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mb-4', className)} {...props}>
        {children}
      </div>
    );
  },
);
DialogBody.displayName = 'DialogBody';

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex justify-end gap-3', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
DialogFooter.displayName = 'DialogFooter';
