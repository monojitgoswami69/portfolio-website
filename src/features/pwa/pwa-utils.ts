"use client";

/**
 * PWA Utilities - Helper functions for Progressive Web App features
 */

// Check if app is running in standalone mode (installed as PWA)
export const isStandaloneMode = (): boolean => {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as unknown as { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
};

// Check if PWA installation is possible
export const isPWAInstallable = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  return isIOS || isAndroid;
};

// Get the display mode (standalone, fullscreen, minimal-ui, browser)
export const getDisplayMode = (): string => {
  if (typeof window === "undefined") return "browser";

  const nav = window.navigator as unknown as { standalone?: boolean };
  if (nav.standalone === true) return "standalone";
  if (window.matchMedia("(display-mode: fullscreen)").matches) return "fullscreen";
  if (window.matchMedia("(display-mode: standalone)").matches) return "standalone";
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return "minimal-ui";

  return "browser";
};

// Check if service worker is supported
export const isServiceWorkerSupported = (): boolean => {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
};

// Request service worker update
export const requestServiceWorkerUpdate = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log("✓ Checked for service worker updates");
  } catch (error) {
    console.error("✗ Failed to update service worker:", error);
  }
};

// Clear all caches
export const clearAllCaches = async (): Promise<void> => {
  if (typeof caches === "undefined") return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log("✓ All caches cleared");

    // Notify service worker to clear its caches
    if (isServiceWorkerSupported()) {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: "CLEAR_CACHE" });
    }
  } catch (error) {
    console.error("✗ Failed to clear caches:", error);
  }
};

// Get cache size (approximate)
export const getCacheSize = async (): Promise<number> => {
  if (typeof caches === "undefined" || typeof navigator.storage === "undefined") {
    return 0;
  }

  try {
    const storage = navigator.storage as unknown as { estimate?: () => Promise<{ usage?: number }> };
    const estimate = await storage.estimate?.();
    return estimate?.usage || 0;
  } catch (error) {
    console.error("✗ Failed to get cache size:", error);
    return 0;
  }
};

// Detect online/offline status
export const isOnline = (): boolean => {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
};

// Listen for online/offline status changes
export const onOnlineStatusChange = (callback: (isOnline: boolean) => void): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

// Get PWA info
export interface PWAInfo {
  isStandalone: boolean;
  isPWAInstallable: boolean;
  displayMode: string;
  isOnline: boolean;
  swSupported: boolean;
}

export const getPWAInfo = (): PWAInfo => {
  return {
    isStandalone: isStandaloneMode(),
    isPWAInstallable: isPWAInstallable(),
    displayMode: getDisplayMode(),
    isOnline: isOnline(),
    swSupported: isServiceWorkerSupported(),
  };
};
