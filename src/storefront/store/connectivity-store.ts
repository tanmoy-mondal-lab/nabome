"use client";

import { create } from "zustand";
import { api } from "../../lib/api/client";
import { hapticSuccess, hapticError } from "../../lib/utils/haptic";

interface ConnectivityState {
  isOnline: boolean;
  isAuthenticated: boolean;
  lastOnline: number;
  offlineQueue: Array<{ action: () => Promise<void>; id: string }>;
  notificationsEnabled: boolean;
  connectionType: "wifi" | "cellular" | "ethernet" | "unknown";
  isMobile: boolean;
  isDesktop: boolean;
  emergencyMode: boolean;
  offlineTimer: ReturnType<typeof setTimeout> | null;
  notificationShown: boolean;
  
  // Actions
  setOnline: (online: boolean) => void;
  setAuthenticated: (auth: boolean) => void;
  addToOfflineQueue: (action: () => Promise<void>) => string;
  executeOfflineQueue: () => Promise<void>;
  clearOfflineQueue: () => void;
  setConnectionType: (type: ConnectivityState["connectionType"]) => void;
  setNotificationShown: (shown: boolean) => void;
  setEmergencyMode: (mode: boolean) => void;
  reset: () => void;
}

export const useConnectivityStore = create<ConnectivityState>((set, get) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isAuthenticated: false,
  lastOnline: Date.now(),
  offlineQueue: [],
  notificationsEnabled: true,
  connectionType: "unknown",
  isMobile: typeof window !== "undefined" ? /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent) : false,
  isDesktop: typeof window !== "undefined" ? !/Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent) : true,
  emergencyMode: false,
  offlineTimer: null,
  notificationShown: false,

  setOnline: (online) => {
    const state = get();
    if (state.isOnline === online) return;
    
    set({ 
      isOnline: online, 
      lastOnline: Date.now() 
    });
    
    if (online) {
      if (state.offlineQueue.length > 0) {
        void get().executeOfflineQueue();
      }
      if (state.isMobile) {
        hapticSuccess();
      }
      set({ notificationShown: false });
    } else {
      if (state.isMobile) {
        hapticError();
      }
    }
  },

  setAuthenticated: (auth) => set({ isAuthenticated: auth }),

  addToOfflineQueue: (action) => {
    const id = crypto.randomUUID();
    set((state) => ({
      offlineQueue: [...state.offlineQueue, { action, id }]
    }));
    return id;
  },

  executeOfflineQueue: async () => {
    const { offlineQueue } = get();
    if (offlineQueue.length === 0) return;
    
    for (const item of offlineQueue) {
      try {
        await item.action();
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((q) => q.id !== item.id)
        }));
      } catch (error) {
        // Silent failure - offline action failed
      }
    }
  },

  clearOfflineQueue: () => set({ offlineQueue: [] }),

  setConnectionType: (type) => set({ connectionType: type }),

  setNotificationShown: (shown) => set({ notificationShown: shown }),

  setEmergencyMode: (mode) => set({ emergencyMode: mode }),

  reset: () => set({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isAuthenticated: false,
    lastOnline: Date.now(),
    offlineQueue: [],
    notificationsEnabled: true,
    connectionType: "unknown",
    isMobile: typeof window !== "undefined" ? /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent) : false,
    isDesktop: typeof window !== "undefined" ? !/Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent) : true,
    emergencyMode: false,
    offlineTimer: null,
    notificationShown: false,
  }),
}));

async function addToEmergencyNotification() {
  try {
    await api.post("/notifications/offline", { timestamp: Date.now() });
  } catch {
    // Silent failure - notification not critical
  }
}
