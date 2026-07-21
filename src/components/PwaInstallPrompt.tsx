import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const DISMISSED_KEY = "nabome-pwa-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: "accepted" | "dismissed" }>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed === "true") return;

    const timerIds: ReturnType<typeof setTimeout>[] = [];

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const id = setTimeout(() => setShowBanner(true), 30000);
      timerIds.push(id);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      timerIds.forEach(clearTimeout);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    void deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  return (
    <AnimatePresence>
      {showBanner && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg p-4 md:p-5 md:bottom-0 bottom-[calc(60px+env(safe-area-inset-bottom,0px))]"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 100 100" className="w-10 h-10 shrink-0">
                <rect width="100" height="100" rx="12" fill="#8b6940" />
                <text x="50" y="68" fontFamily="serif" fontSize="52" fontWeight="700" fill="white" textAnchor="middle">N</text>
              </svg>
              <div>
                <p className="text-sm font-medium text-neutral-900">Install নবME</p>
                <p className="text-xs text-neutral-500">Add to your home screen for a better experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-brand-500 text-white text-xs uppercase tracking-wider hover:bg-brand-600 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
