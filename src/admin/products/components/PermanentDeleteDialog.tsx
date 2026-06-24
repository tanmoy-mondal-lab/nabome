import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Trash2, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../../common/Modal";

interface PermanentDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  loading?: boolean;
  count?: number;
}

export function PermanentDeleteDialog({
  open,
  onClose,
  onConfirm,
  productName,
  loading,
  count,
}: PermanentDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isBulk = count !== undefined && count > 1;
  const requiredText = isBulk ? "DELETE ALL" : productName;
  const matches = confirmText === requiredText;

  useEffect(() => {
    if (open) {
      setConfirmText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="space-y-5 -mt-1">
        {/* Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25"
          >
            <Trash2 size={24} className="text-white" />
          </motion.div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-display font-semibold text-neutral-900">
            {isBulk ? `Permanently delete ${count} products?` : "Permanently delete product?"}
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
            {isBulk ? (
              <>This will permanently remove <span className="font-medium text-neutral-700">{count} products</span> from your database. This action cannot be undone.</>
            ) : (
              <>This will permanently remove <span className="font-medium text-neutral-700">"{productName}"</span> from your database. This action cannot be undone.</>
            )}
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <div className="text-xs text-red-700 space-y-1">
              <p className="font-medium">This will permanently:</p>
              <ul className="list-disc list-inside space-y-0.5 text-red-600">
                <li>Delete all product images from Cloudinary</li>
                <li>Remove all variants and their media</li>
                <li>Remove all product tags and labels</li>
                <li>Remove from any lookbooks or related products</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Type-to-confirm */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
            <Type size={12} />
            Type <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-800">{requiredText}</span> to confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={isBulk ? "Type DELETE ALL" : `Type "${productName}"`}
            className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors placeholder:text-neutral-300"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches && !loading) onConfirm();
              if (e.key === "Escape") onClose();
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !matches}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-red-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Permanently Delete
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
