export declare function useConnectivityManager(): {
    isOnline: boolean;
    isAuthenticated: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    emergencyMode: boolean;
    connectionType: "unknown" | "wifi" | "cellular" | "ethernet";
    offlineQueueSize: number;
    notificationsEnabled: boolean;
    notificationShown: boolean;
    isRecoverableConnection: () => boolean;
};
