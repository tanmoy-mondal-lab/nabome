import { AlertTriangle, Trash2, Eye, EyeOff } from "lucide-react";
import { Modal } from "../../common/Modal";

interface BulkActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "publish" | "archive" | "delete";
  count: number;
  loading?: boolean;
}

const ACTION_CONFIG = {
  publish: {
    title: "Publish Products",
    icon: Eye,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    buttonClass: "bg-green-600 hover:bg-green-700",
    buttonText: "Publish",
    message: (count: number) => `Are you sure you want to publish ${count} product${count === 1 ? "" : "s"}? They will become visible on the storefront.`,
  },
  archive: {
    title: "Archive Products",
    icon: EyeOff,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    buttonClass: "bg-amber-600 hover:bg-amber-700",
    buttonText: "Archive",
    message: (count: number) => `Are you sure you want to archive ${count} product${count === 1 ? "" : "s"}? They will be hidden from the storefront.`,
  },
  delete: {
    title: "Delete Products",
    icon: Trash2,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    buttonClass: "bg-red-600 hover:bg-red-700",
    buttonText: "Delete",
    message: (count: number) => `Are you sure you want to delete ${count} product${count === 1 ? "" : "s"}? This will deactivate them and remove all images.`,
  },
};

export function BulkActionDialog({ open, onClose, onConfirm, action, count, loading }: BulkActionDialogProps) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  return (
    <Modal open={open} onClose={onClose} title={config.title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-neutral-700">{config.message(count)}</p>
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
            className={`px-4 py-2 text-sm font-medium text-white ${config.buttonClass} rounded-lg transition-colors disabled:opacity-50`}
          >
            {loading ? "Processing..." : config.buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
