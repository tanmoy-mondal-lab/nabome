import { X } from 'lucide-react';
import { useEffect, createContext } from 'react';
import type { ReactNode } from 'react';

interface DialogContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}): ReactNode {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <DialogContext.Provider value={{ isOpen, onClose }}>
      <div
        className="fixed inset-0 z-(--z-modal) flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
      >
        <div
          className="relative w-full max-w-md rounded-lg bg-(--bg-surface) border border-(--border-default) shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-(--border-subtle) p-4">
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-(--text-primary)"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-(--text-tertiary) hover:text-(--text-primary)"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return <div className="space-y-4">{children}</div>;
}

export function DialogActions({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return <div className="flex justify-end gap-2 pt-4">{children}</div>;
}
