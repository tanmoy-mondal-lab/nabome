// ─────────────────────────────────────────────────────────────
// KEYBOARD NAVIGATION HOOK
// ─────────────────────────────────────────────────────────────
// Provides keyboard navigation utilities for accessibility
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

export function useKeyboardNavigation(
  handlers: Record<string, () => void>,
  deps: React.DependencyList = []
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = handlersRef.current[e.key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
     
  }, deps);
}

export function useEscapeHandler(callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        callback();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [callback, enabled]);
}

export function useArrowNavigation(
  itemCount: number,
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex((currentIndex + 1) % itemCount);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex((currentIndex - 1 + itemCount) % itemCount);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemCount, currentIndex, setCurrentIndex, enabled]);
}
