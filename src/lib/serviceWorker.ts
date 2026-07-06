// Enhanced service worker registration with offline support
// Supports both mobile and desktop platforms

const SW_URL = "/sw.js";
const SW_SCOPE = "/";

let swRegistration: ServiceWorkerRegistration | null = null;
let isSupported = typeof window !== "undefined" && "serviceWorker" in navigator;
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
      
      // Periodic sync for mobile apps (if available)
      if ((registration as any).periodicSync) {
        try {
          (registration as any).periodicSync.register("content-sync", {
            minInterval: 60 * 60 * 1000 // 1 hour
          });
        } catch {
          // Periodic sync not supported
        }
      }
      
      resolve();
    };

    const onError = (error: Error) => {
      // Don't reject - app should work without service worker
      // Log error in development only
      if (import.meta.env.DEV) {
        console.warn("Service worker registration failed:", error.message);
      }
      resolve();
    };

    const timeoutId = setTimeout(() => {
      onError(new Error("Service worker registration timeout"));
    }, 5000);

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
      loadSW();
    } else {
      swRegistration.update().finally(() => {
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

  return new Promise((resolve) => {
    swRegistration!.waiting!.addEventListener("statechange", (e) => {
      if ((e.target as ServiceWorker).state === "activated") {
        swRegistration = null;
        if (typeof window !== "undefined") {
          window.location.reload();
        }
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
      if (swRegistration && (swRegistration as any).sync) {
        (swRegistration as any).sync.register("cart-sync").catch(() => {
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
  const handleConnectionChangeEvent = () => handleConnectionChange();

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  window.addEventListener("connectionchange", handleConnectionChangeEvent);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("connectionchange", handleConnectionChangeEvent);
    
    intervals.forEach(id => clearInterval(id as any));
  };
}
