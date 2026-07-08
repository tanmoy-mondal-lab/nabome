// ─────────────────────────────────────────────────────────────
// DARK MODE HOOK
// ─────────────────────────────────────────────────────────────
// Manages dark mode state with system preference detection
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const DARK_MODE_KEY = "nabome-dark-mode";
const DARK_MODE_CLASS = "dark";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) {
      setIsDark(stored === "true");
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Update DOM
    if (isDark) {
      document.documentElement.classList.add(DARK_MODE_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_MODE_CLASS);
    }

    // Update localStorage
    localStorage.setItem(DARK_MODE_KEY, isDark.toString());
  }, [isDark, isInitialized]);

  const toggle = () => setIsDark((prev) => !prev);
  const setDark = (value: boolean) => setIsDark(value);

  return { isDark, toggle, setDark, isInitialized };
}

export function useSystemDarkMode() {
  const [isSystemDark, setIsSystemDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsSystemDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isSystemDark;
}
