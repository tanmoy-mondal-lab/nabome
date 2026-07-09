export declare function registerServiceWorker(): Promise<void>;
export declare function unregisterServiceWorker(): Promise<void>;
export declare function skipWaiting(): Promise<void>;
export declare function isUpdateAvailable(): boolean;
export declare function getSWRegistration(): ServiceWorkerRegistration | null;
export declare function setupConnectivityDetection(): (() => void) | undefined;
