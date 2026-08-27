import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Offline Indicator component following ERROR_HANDLING_LOADING_STATES_USER_FEEDBACK_SPECIFICATION.md
 *
 * Features:
 * - Detects online/offline status
 * - Shows indicator when offline
 * - Accessible with ARIA live region
 * - Dismissible
 */
export function OfflineIndicator(): ReactNode {
  const [isOnline, setIsOnline] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div
      className="fixed bottom-16 left-4 right-4 z-[9999] rounded-xl bg-amber-50 border border-amber-200 p-5 shadow-xl animate-fade-in-up desktop:bottom-4 desktop:left-auto desktop:right-4 desktop:w-96"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <WifiOff className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-amber-900">You're offline</p>
          <p className="text-xs text-amber-700">
            Some features may be unavailable. Please check your internet
            connection.
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-amber-400 hover:text-amber-600 hover:bg-amber-100 p-1 rounded-full transition-all"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
