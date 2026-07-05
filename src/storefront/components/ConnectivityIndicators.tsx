"use client";

import { useEffect, useState } from "react";
import { useConnectivityManager } from "../hooks/useConnectivityManager";
import { cn } from "../../lib/utils/cn";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, isMobile, emergencyMode, notificationShown } = useConnectivityManager();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline && !isMobile && (show || notificationShown)) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else if (isOnline || isMobile) {
      setShow(false);
    }
  }, [isOnline, isMobile, notificationShown]);

  if (isOnline || (isMobile && !emergencyMode) || (!show)) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300",
      "bg-yellow-50 border border-yellow-200 text-yellow-800",
      "flex items-center justify-between",
      className
    )}>
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p className="font-medium">You're offline</p>
          <p className="text-sm">Changes will be saved when you reconnect</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isMobile && (
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
            className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-md text-sm font-medium transition-colors"
          >
            Retry Now
          </button>
        )}
      </div>
    </div>
  );
}

export function EmergencyModeIndicator() {
  const { emergencyMode, isMobile } = useConnectivityManager();

  if (!emergencyMode || isMobile) {
    return null;
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300",
      "bg-red-50 border border-red-200 text-red-800",
      "max-w-xs"
    )}>
      <div className={cn("flex items-center gap-3 mb-2")}>
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-bold">Emergency Mode</p>
          <p className="text-xs">Connection unstable</p>
        </div>
      </div>
      <p className="text-sm">We've auto-recovered. Please refresh to ensure full functionality.</p>
    </div>
  );
}

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  useConnectivityManager();
  return children;
}