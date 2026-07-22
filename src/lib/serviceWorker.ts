// Enhanced service worker registration with offline support
// Supports both mobile and desktop platforms

const SW_URL = "/sw.js";
const SW_SCOPE = "/";

let swRegistration: ServiceWorkerRegistration | null = null;
const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator;
let updateAvailable = false;

export function registerServiceWorker(): Promise<void> {
  if (!isSupported) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const onSuccess = (registration: ServiceWorkerRegistration) => {
      swRegistration = registration;
      
      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          updateAvailable = true;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              updateAvailable = true;
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("sw:update"));
              }
            }
          });
        }
      });
      
      // Periodic sync for mobile apps (if available).
      // Only attempt once the service worker is active — registering against an
      // installing/waiting worker rejects with an InvalidStateError. The call
      // returns a Promise, so the rejection must be caught (a try/catch does not
      // catch async rejections and it surfaces as an uncaught page error).
      const periodicSync = (registration as ServiceWorkerRegistration & { periodicSync?: { register: (name: string, options: { minInterval: number }) => Promise<void> } }).periodicSync;
      if (periodicSync && registration.active) {
        void Promise.resolve(
          periodicSync.register("content-sync", {
            minInterval: 60 * 60 * 1000 // 1 hour
          })
        ).catch(() => {
          // Periodic sync not supported / not permitted
        });
      }
      
      resolve();
    };

    const onError = (error: Error) => {
      // Don't reject - app should work without service worker
      // Log error in development only
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Service worker registration failed:", error.message);
      }
      resolve();
    };

    const timeoutId = setTimeout(() => {
      onError(new Error("Service worker registration timeout"));
    }, 10000);

    const loadSW = () => {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE })
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          clearTimeout(timeoutId);
        });
    };

    if (!swRegistration) {
      void loadSW();
    } else {
      void swRegistration.update().finally(() => {
        resolve();
      });
    }
  });
}

export function unregisterServiceWorker(): Promise<void> {
  if (!swRegistration) {
    return Promise.resolve();
  }

  return swRegistration.unregister().then(() => Promise.resolve());
}

export function skipWaiting(): Promise<void> {
  if (!swRegistration || !swRegistration.waiting) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    swRegistration!.waiting!.addEventListener("statechange", (e) => {
      if ((e.target as ServiceWorker).state === "activated") {
        swRegistration = null;
        if (typeof window !== "undefined") {
          window.location.reload();
        }
        resolve();
      }
    });

    swRegistration!.waiting!.postMessage("skipWaiting");
  });
}

export function isUpdateAvailable(): boolean {
  return updateAvailable;
}

export function getSWRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

// Enhanced offline detection for mobile and desktop
export function setupConnectivityDetection() {
  if (typeof window === "undefined") return;
  
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent);
  
  // Enhanced offline detection for mobile (more aggressive)
  const handleConnectionChange = () => {
    const isNowOnline = navigator.onLine;
    
    if (!isNowOnline && isMobile) {
      // Mobile-specific offline handling
      
      // Request background sync for future operations
      if (swRegistration && (swRegistration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync) {
        (swRegistration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("cart-sync").catch(() => {
          // Silent fail - sync not critical
        });
      }
    }
    
    window.dispatchEvent(new CustomEvent("connectivity:change", {
      detail: { isOnline: isNowOnline, isMobile }
    }));
  };

  const intervals: ReturnType<typeof setInterval>[] = [];
  
  // Mobile: More frequent checks for connection stability
  if (isMobile) {
    const checkInterval = setInterval(() => {
      const wasOnline = navigator.onLine;
      // Force check
      handleConnectionChange();
      
      // If connection state changed, ensure we have the right state
      if (wasOnline !== navigator.onLine) {
        window.dispatchEvent(new Event(navigator.onLine ? "online" : "offline"));
      }
    }, 5000); // Check every 5 seconds on mobile
    intervals.push(checkInterval);
  }
  
  // Desktop: Less frequent but still responsive
  const desktopCheck = setInterval(() => {
    const wasOnline = navigator.onLine;
    // Periodic check for desktop
    if (wasOnline !== navigator.onLine) {
      window.dispatchEvent(new Event(navigator.onLine ? "online" : "offline"));
    }
  }, 30000); // Check every 30 seconds on desktop
  intervals.push(desktopCheck);

  const handleOnline = () => handleConnectionChange();
  const handleOffline = () => handleConnectionChange();

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);

    intervals.forEach(id => clearInterval(id));
  };
}
