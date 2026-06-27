import { useEffect, useRef } from "react";
import { loadTurnstileScript } from "../lib/turnstile";

type TurnstileWidgetApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "compact";
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove?: (widgetId: string) => void;
  ready: (callback: () => void) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidgetApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onTokenChange: (token: string) => void;
  onError?: (message: string) => void;
  action?: string;
  size?: "normal" | "compact";
  theme?: "auto" | "light" | "dark";
  className?: string;
}

export function TurnstileWidget({
  siteKey,
  onTokenChange,
  onError,
  action,
  size = "normal",
  theme = "light",
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onTokenChange, onError });

  useEffect(() => {
    callbacksRef.current = { onTokenChange, onError };
  }, [onTokenChange, onError]);

  useEffect(() => {
    let cancelled = false;

    if (!siteKey || !containerRef.current) {
      callbacksRef.current.onTokenChange("");
      return () => undefined;
    }

    async function renderWidget() {
      try {
        await loadTurnstileScript();
        if (cancelled || !containerRef.current || !window.turnstile) return;

        containerRef.current.innerHTML = "";
        if (widgetIdRef.current && window.turnstile.remove) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          size,
          theme,
          callback: (token: string) => {
            callbacksRef.current.onTokenChange(token);
          },
          "error-callback": () => {
            callbacksRef.current.onTokenChange("");
            callbacksRef.current.onError?.("Verification failed. Please try again.");
          },
          "expired-callback": () => {
            callbacksRef.current.onTokenChange("");
          },
        });
      } catch (err) {
        if (!cancelled) {
          callbacksRef.current.onTokenChange("");
          callbacksRef.current.onError?.(err instanceof Error ? err.message : "Verification widget unavailable");
        }
      }
    }

    renderWidget();

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, action, size, theme]);

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
