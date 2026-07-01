import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape?: () => void
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active) return undefined;

    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const getFocusable = () => Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);

    const focusTimer = window.setTimeout(() => {
      const first = getFocusable()[0] ?? containerRef.current;
      first?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        containerRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [active, onEscape]);

  return containerRef;
}
