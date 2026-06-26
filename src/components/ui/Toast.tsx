import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type React from "react";
import { cn } from "../../lib/utils/cn";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function Toaster({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="assertive" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-6 py-3 text-sm font-body shadow-lg animate-slide-up",
              "max-w-sm rounded",
              t.type === "success" && "bg-green-800 text-white",
              t.type === "error" && "bg-red-800 text-white",
              t.type === "info" && "bg-neutral-900 text-white"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
