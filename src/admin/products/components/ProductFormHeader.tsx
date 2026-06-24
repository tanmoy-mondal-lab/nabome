import { ArrowLeft, Save, Copy, ChevronDown, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductFormHeaderProps {
  isEdit: boolean;
  productName: string;
  saving: boolean;
  saveError: string | null;
  dirty: boolean;
  onBack: () => void;
  onSave: () => void;
  onDuplicate?: () => void;
  onDismissError: () => void;
}

export function ProductFormHeader({
  isEdit,
  productName,
  saving,
  saveError,
  dirty,
  onBack,
  onSave,
  onDuplicate,
  onDismissError,
}: ProductFormHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 -mx-6 -mt-6 px-6 py-3 mb-6">
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{saveError}</span>
              </div>
              <button onClick={onDismissError} className="text-red-500 hover:text-red-700 text-xs font-medium">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-neutral-900">
                {isEdit ? "Edit Product" : "New Product"}
              </h1>
              <AnimatePresence>
                {dirty && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    Unsaved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isEdit ? (productName || "Untitled product") : "Create a new product"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 mr-2 hidden sm:inline">
            Ctrl+S to save
          </span>
          {isEdit && onDuplicate && (
            <button
              onClick={onDuplicate}
              className="flex items-center gap-1.5 border border-neutral-200 px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Copy size={12} /> Duplicate
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving || (!dirty && isEdit)}
            className="flex items-center gap-1.5 bg-neutral-900 text-white px-5 py-1.5 text-xs font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
