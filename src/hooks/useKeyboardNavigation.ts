import { useEffect, useCallback } from "react";

type Shortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
};

export function useKeyboardNavigation(shortcuts: Shortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlMatch = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const shiftMatch = !!shortcut.shift === e.shiftKey;
        const altMatch = !!shortcut.alt === e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (isInput && !shortcut.ctrl) continue;
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useTrapFocus(containerRef: React.RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener("keydown", handleTab);
    first.focus();

    return () => container.removeEventListener("keydown", handleTab);
  }, [containerRef, active]);
}

// Common shortcuts for the marketplace
export const commonShortcuts: Shortcut[] = [
  { key: "/", handler: () => { document.querySelector<HTMLInputElement>('[data-search-input]')?.focus(); }, description: "Focus search" },
  { key: "Escape", handler: () => { document.querySelector<HTMLButtonElement>('[data-close-modal]')?.click(); }, description: "Close modal" },
  { key: "c", ctrl: true, handler: () => { window.location.href = "/cart"; }, description: "Go to cart" },
  { key: "w", ctrl: true, handler: () => { window.location.href = "/wishlist"; }, description: "Go to wishlist" },
];
