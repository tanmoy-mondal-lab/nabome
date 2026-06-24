import { AlertTriangle } from "lucide-react";
import { Modal } from "../../common/Modal";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  loading?: boolean;
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, productName, loading }: DeleteConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Product" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-700">
              Are you sure you want to delete <span className="font-medium text-neutral-900">"{productName}"</span>?
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              This will deactivate the product and remove all its images. This action can be undone by restoring the product.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
