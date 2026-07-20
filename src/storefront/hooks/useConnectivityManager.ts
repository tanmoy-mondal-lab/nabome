"use client";

import { useEffect, useCallback } from "react";
import { useConnectivityStore } from "../store/connectivity-store";
import type { ConnectivityState } from "../store/connectivity-store";
import { useCartStore } from "../stores/cart-store";
import { useCartSync } from "./useCartSync";

export function useConnectivityManager() {
  const { setOnline, setAuthenticated, addToOfflineQueue, clearOfflineQueue: _clearOfflineQueue, setConnectionType, setNotificationShown, setEmergencyMode, isOnline, isAuthenticated, isMobile, isDesktop, emergencyMode } = useConnectivityStore();
  const { items } = useCartStore();
  const { mergeGuestCartOnServer } = useCartSync(items);

  useEffect(() => {
    const updateConnection = () => {
      setOnline(navigator.onLine);
    };

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    const detectConnectionType = () => {
      if (typeof navigator === "undefined") return;
      
      const connection = (navigator as { connection?: { type: string; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void }; mozConnection?: { type: string; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void }; webkitConnection?: { type: string; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).connection || (navigator as { mozConnection?: { type: string; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).mozConnection || (navigator as { webkitConnection?: { type: string; addEventListener?: (event: string, handler: () => void) => void; removeEventListener?: (event: string, handler: () => void) => void } }).webkitConnection;
      if (connection) {
        setConnectionType(connection.type as ConnectivityState["connectionType"]);
        
        const updateConnectionType = () => {
          setConnectionType(connection.type as ConnectivityState["connectionType"]);
        };
        
        if (connection.addEventListener && connection.removeEventListener) {
          connection.addEventListener("change", updateConnectionType);
          return () => {
            if (connection.removeEventListener) {
              connection.removeEventListener("change", updateConnectionType);
            }
          };
        }
      }
    };

    const connectionTypeCleanup = detectConnectionType();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("connectionchange", updateConnection);
    void updateConnection();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("connectionchange", updateConnection);
      if (connectionTypeCleanup) connectionTypeCleanup();
    };
  }, [setOnline, setConnectionType]);

  useEffect(() => {
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setAuthenticated(!!customEvent.detail?.isAuthenticated);
    };

    window.addEventListener("auth:login", handleAuthChange);
    window.addEventListener("auth:logout", handleAuthChange);
    window.addEventListener("auth:session-refresh", handleAuthChange);

    return () => {
      window.removeEventListener("auth:login", handleAuthChange);
      window.removeEventListener("auth:logout", handleAuthChange);
      window.removeEventListener("auth:session-refresh", handleAuthChange);
    };
  }, [setAuthenticated]);

  useEffect(() => {
    if (!isOnline && items.length > 0) {
      const offlineKey = `cart-sync-${items.map(i => `${i.variantId}:${i.quantity}`).join(",")}`;
      if (!sessionStorage.getItem(offlineKey)) {
        sessionStorage.setItem(offlineKey, "1");
        addToOfflineQueue(async () => {
          await mergeGuestCartOnServer(items);
          sessionStorage.removeItem(offlineKey);
        });
      }
    }
  }, [isOnline, addToOfflineQueue, items, mergeGuestCartOnServer]);

  useEffect(() => {
    const stabilityTimeout = setTimeout(() => {
      if (!isOnline) {
        setEmergencyMode(true);
        if (!isMobile && !sessionStorage.getItem("offline-notified-desktop")) {
          sessionStorage.setItem("offline-notified-desktop", "true");
          setNotificationShown(true);
        }
      }
    }, 5000);

    return () => clearTimeout(stabilityTimeout);
  }, [isOnline, isMobile, setEmergencyMode, setNotificationShown]);

  useEffect(() => {
    if (emergencyMode) {
      const timer = setTimeout(() => {
        setEmergencyMode(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [emergencyMode, setEmergencyMode]);

  const isRecoverableConnection = useCallback(() => {
    const { connectionType } = useConnectivityStore.getState();
    return connectionType === "wifi" || connectionType === "ethernet";
  }, []);

  return {
    isOnline,
    isAuthenticated,
    isMobile,
    isDesktop,
    emergencyMode,
    connectionType: useConnectivityStore((s) => s.connectionType),
    offlineQueueSize: useConnectivityStore((s) => s.offlineQueue.length),
    notificationsEnabled: useConnectivityStore((s) => s.notificationsEnabled),
    notificationShown: useConnectivityStore((s) => s.notificationShown),
    isRecoverableConnection,
  };
}
