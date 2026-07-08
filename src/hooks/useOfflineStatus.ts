// ─────────────────────────────────────────────────────────────
// OFFLINE STATUS HOOK
// ─────────────────────────────────────────────────────────────
// Detects online/offline status and provides utilities
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Set initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      // Get connection type if available
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || "unknown");
      }
    };

    // Set initial state
    updateNetworkStatus();

    // Add event listeners
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Listen for connection type changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateNetworkStatus);
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      if (connection) {
        connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return { isOnline, connectionType };
}
