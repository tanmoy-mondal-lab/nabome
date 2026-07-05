"use client";

import { useEffect, useRef, useCallback } from "react";
import { useConnectivityStore } from "../store/connectivity-store";
import { useCartStore } from "../stores/cart-store";

export function useConnectivityManager() {
  const prevOnlineRef = useRef(true);
  const { setOnline, setAuthenticated, addToOfflineQueue, clearOfflineQueue, setConnectionType, setNotificationShown, setEmergencyMode, isOnline, isAuthenticated, isMobile, isDesktop, emergencyMode } = useConnectivityStore();

  useEffect(() => {
    const updateConnection = () => {
      setOnline(navigator.onLine);
    };

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    const detectConnectionType = () => {
      if (typeof navigator === "undefined") return;
      
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.type as any);
        
        const updateConnectionType = () => {
          setConnectionType(connection.type as any);
        };
        
        connection.addEventListener("change", updateConnectionType);
        return () => connection.removeEventListener("change", updateConnectionType);
      }
    };

    const connectionTypeCleanup = detectConnectionType();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("connectionchange", updateConnection);

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
    const cartSync = async () => {
      const { items } = useCartStore.getState();
      
      if (!isOnline && items.length > 0) {
        const { mergeGuestCart } = useCartStore.getState();
        addToOfflineQueue(() => mergeGuestCart(items));
      }
    };

    cartSync();
  }, [isOnline]);

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
  }, [isOnline, isMobile]);

  useEffect(() => {
    if (emergencyMode) {
      const timer = setTimeout(() => {
        setEmergencyMode(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [emergencyMode]);

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
    connectionType: useConnectivityStore((s: any) => s.connectionType),
    offlineQueueSize: useConnectivityStore((s: any) => s.offlineQueue.length),
    notificationsEnabled: useConnectivityStore((s: any) => s.notificationsEnabled),
    notificationShown: useConnectivityStore((s: any) => s.notificationShown),
    isRecoverableConnection,
  };
}
