import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_ID;

export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID || import.meta.env.DEV) return;

    const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`);
    if (existing) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args) { window.dataLayer.push(args); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: true, anonymize_ip: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
