import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Global Loading component following ERROR_HANDLING_LOADING_STATES_USER_FEEDBACK_SPECIFICATION.md
 *
 * Features:
 * - Full-screen loading overlay
 * - Accessible with ARIA live region
 * - Prevents interaction while loading
 * - Smooth transitions
 * - Can be connected to a global loading state store
 */
export function GlobalLoading(): ReactNode {
  // This component can be connected to a global loading state store
  // For now, it's a placeholder that can be triggered by a store or context
  const isLoading = false;

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-gray-900">Loading...</p>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your experience
          </p>
        </div>
      </div>
    </div>
  );
}
