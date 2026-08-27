/**
 * Accessibility utilities following ACCESSIBILITY_I18N_LOCALIZATION_SPECIFICATION.md
 *
 * Features:
 * - Focus management
 * - Keyboard navigation helpers
 * - Screen reader announcements
 * - ARIA attribute helpers
 * - Reduced motion detection
 */

/**
 * Traps focus within a container element (for modals, dialogs, etc.)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleTab);
  };
}

/**
 * Announces a message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Detects if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Generates a unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateId(prefix: string): string {
  return `${prefix}-${idCounter++}`;
}

/**
 * Manages focus restoration when returning to a previous context
 */
export function useFocusRestoration() {
  const previousActiveElement = document.activeElement as HTMLElement;

  return {
    restore: () => {
      previousActiveElement?.focus();
    },
  };
}
