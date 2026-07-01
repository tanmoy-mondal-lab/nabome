import { type ReactNode, useEffect, useId } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const titleId = useId();
  const modalRef = useFocusTrap<HTMLDivElement>(open, onClose);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-modal max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
          <h2 id={titleId} className="font-display text-lg text-neutral-900">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
