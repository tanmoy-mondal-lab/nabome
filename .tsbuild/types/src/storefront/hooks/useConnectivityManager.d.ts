export declare function useConnectivityManager(): {
    isOnline: boolean;
    isAuthenticated: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    emergencyMode: boolean;
    connectionType: any;
    offlineQueueSize: any;
    notificationsEnabled: any;
    notificationShown: any;
    isRecoverableConnection: () => boolean;
};
