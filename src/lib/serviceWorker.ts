// Enhanced service worker registration with offline support
// Supports both mobile and desktop platforms

const SW_URL = "/sw.js";
const SW_SCOPE = "/";

let swRegistration: ServiceWorkerRegistration | null = null;
let isSupported = "serviceWorker" in navigator;
let updateAvailable = false;

export function registerServiceWorker(): Promise<void> {
  if (!isSupported) {
    console.warn("Service Workers not supported in this browser");
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const onSuccess = (registration: ServiceWorkerRegistration) => {
      swRegistration = registration;
      console.log("Service Worker registered successfully:", registration);
      
      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          updateAvailable = true;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              updateAvailable = true;
              window.dispatchEvent(new CustomEvent("sw:update"));
            }
          });
        }
      });
      
      // Periodic sync for mobile apps (if available)
      if (registration.periodicSync) {
        try {
          registration.periodicSync.register("content-sync", { 
            minInterval: 60 * 60 * 1000 // 1 hour
          });
        } catch {
          // Periodic sync not supported
        }
      }
      
      resolve();
    };

    const onError = (error: Error) => {
      console.error("Service Worker registration failed:", error);
      // Don't reject - app should work without service worker
      resolve();n    };

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
  
  return swRegistration.unregister();
}

export function skipWaiting(): Promise<void> {
  if (!swRegistration || !swRegistration.waiting) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    swRegistration!.waiting!.addEventListener("statechange", (e) => {
      if ((e.target as ServiceWorker).state === "activated") {
        swRegistration = null;
        window.location.reload();
      }
    });
    
    swRegistration.waiting!.postMessage("skipWaiting");
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
      console.log("Mobile device went offline - caching current state");
      
      // Request background sync for future operations
      if (swRegistration && swRegistration.sync) {
        swRegistration.sync.register("cart-sync").catch(() => {
          // Silent fail - sync not critical
        });
      }
    }
    
    window.dispatchEvent(new CustomEvent("connectivity:change", {
      detail: { isOnline: isNowOnline, isMobile }
    }));
  };

  const intervals: number[] = [];
  
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
  window.addEventListener("connectionchange", handleConnectionChange);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("connectionchange", handleConnectionChange);
    
    intervals.forEach(id => clearInterval(id));
  };
}
