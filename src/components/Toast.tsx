import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");

  const value = useMemo(
    () => ({
      showToast: (nextMessage: string) => {
        setMessage(nextMessage);
        window.setTimeout(() => setMessage(""), 2600);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 10000,
            maxWidth: 360,
            border: "1px solid rgba(212, 175, 55, .45)",
            background: "rgba(13, 13, 13, .92)",
            color: "#f7f4eb",
            padding: "16px 18px",
            boxShadow: "0 20px 60px rgba(0,0,0,.45)",
            backdropFilter: "blur(18px)",
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
