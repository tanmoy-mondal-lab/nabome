// ─────────────────────────────────────────────────────────────
// OFFLINE BANNER COMPONENT
// ─────────────────────────────────────────────────────────────
// Displays a banner when the user is offline
// ─────────────────────────────────────────────────────────────

import { useOfflineStatus } from "../hooks/useOfflineStatus";

export function OfflineBanner() {
  const isOffline = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 3.536l5.656 5.656M9.172 9.172l5.656 5.656M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>You are offline. Some features may not be available.</span>
      </div>
    </div>
  );
}
