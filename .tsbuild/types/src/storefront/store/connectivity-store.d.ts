interface ConnectivityState {
    isOnline: boolean;
    isAuthenticated: boolean;
    lastOnline: number;
    offlineQueue: Array<{
        action: () => Promise<void>;
        id: string;
    }>;
    notificationsEnabled: boolean;
    connectionType: "wifi" | "cellular" | "ethernet" | "unknown";
    isMobile: boolean;
    isDesktop: boolean;
    emergencyMode: boolean;
    offlineTimer: ReturnType<typeof setTimeout> | null;
    notificationShown: boolean;
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
export declare const useConnectivityStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ConnectivityState>>;
export {};
