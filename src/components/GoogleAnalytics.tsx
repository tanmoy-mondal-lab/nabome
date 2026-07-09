import { useEffect } from "react";
import { gaId } from "../lib/config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (!gaId || gaId.length === 0 || import.meta.env.DEV) return;

    if (typeof window === "undefined") return;

    const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`);
    if (existing) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args) {
      if (window.dataLayer) {
        window.dataLayer.push(args);
      }
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { send_page_view: true, anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.onerror = () => {
      // Silently fail - analytics not critical
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
