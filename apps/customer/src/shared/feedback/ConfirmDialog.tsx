import type { ReactNode } from 'react';

import { Button } from '@nabome/ui';

import { Dialog, DialogContent, DialogActions } from './Dialog';

/**
 * Confirm Dialog component following ERROR_HANDLING_LOADING_STATES_USER_FEEDBACK_SPECIFICATION.md
 *
 * Features:
 * - Confirmation dialog for destructive actions
 * - Accessible with proper ARIA
 * - Keyboard support (Escape to close)
 * - Customizable title, message, and actions
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}): ReactNode {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <DialogContent>
        {message && (
          <p className="text-sm text-(--text-secondary)">{message}</p>
        )}
        <DialogActions>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
