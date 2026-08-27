/**
 * ---------------------------------------------------------------------------
 * নবME Theme Engine
 * ---------------------------------------------------------------------------
 * Provides theme switching, persistence, and system preference detection.
 * Source of truth: DESIGN_TOKEN_SPECIFICATION.md §8.4.
 */

export type Theme = 'light' | 'dark' | 'admin' | 'shop';

const THEME_STORAGE_KEY = 'nabome-theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Get the current theme from localStorage or system preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored && isValidTheme(stored)) return stored;

  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Set the theme and persist to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  if (!isValidTheme(theme)) {
    throw new Error(`Invalid theme: ${theme}`);
  }

  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  // Dispatch event for React components to listen to
  window.dispatchEvent(
    new CustomEvent('nabome-theme-change', { detail: { theme } }),
  );
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): void {
  const current = getTheme();
  const next: Theme = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

/**
 * Check if a string is a valid theme
 */
function isValidTheme(value: string): value is Theme {
  return ['light', 'dark', 'admin', 'shop'].includes(value);
}

/**
 * Subscribe to theme changes
 */
export function onThemeChange(callback: (theme: Theme) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ theme: Theme }>;
    callback(customEvent.detail.theme);
  };

  window.addEventListener('nabome-theme-change', handler as EventListener);

  // Also listen to system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const systemHandler = () => {
    // Only auto-switch if user hasn't manually set a theme
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      const systemTheme: Theme = mediaQuery.matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  };
  mediaQuery.addEventListener('change', systemHandler);

  return () => {
    window.removeEventListener('nabome-theme-change', handler as EventListener);
    mediaQuery.removeEventListener('change', systemHandler);
  };
}

/**
 * Initialize theme on page load
 */
export function initTheme(): Theme {
  const theme = getTheme();
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  return theme;
}

/**
 * Get all available themes
 */
export const THEMES: readonly Theme[] = [
  'light',
  'dark',
  'admin',
  'shop',
] as const;

/**
 * Theme metadata
 */
export const THEME_METADATA: Record<
  Theme,
  { label: string; description: string }
> = {
  light: { label: 'Light', description: 'Default light theme' },
  dark: { label: 'Dark', description: 'Dark mode theme' },
  admin: { label: 'Admin', description: 'Admin dashboard theme' },
  shop: { label: 'Shop', description: 'Shop storefront theme' },
};
