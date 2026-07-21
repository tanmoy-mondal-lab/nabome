import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
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

const MAX_TOASTS = 5;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function Toaster({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      if (next.length > MAX_TOASTS) return next.slice(next.length - MAX_TOASTS);
      return next;
    });
    const timerId = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(id);
    }, 4000);
    timersRef.current.set(id, timerId);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex flex-col gap-2 pointer-events-none" aria-live="assertive" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-6 py-3 text-sm font-body shadow-lg animate-slide-up pointer-events-auto",
              "w-full md:w-auto md:max-w-sm rounded-lg",
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
