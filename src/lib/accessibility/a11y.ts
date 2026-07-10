/**
 * Accessibility Utilities
 * Provides utilities for WCAG AA compliance, ARIA attributes, keyboard navigation, focus management, and screen reader support.
 */

// ARIA roles for common UI elements
export const ARIA_ROLES = {
  // Navigation
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  banner: 'banner',
  
  // Interactive
  button: 'button',
  link: 'link',
  menu: 'menu',
  menuitem: 'menuitem',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  
  // Forms
  form: 'form',
  search: 'search',
  alert: 'alert',
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  
  // Live regions
  status: 'status',
  log: 'log',
  progressbar: 'progressbar',
  marquee: 'marquee',
  timer: 'timer',
  
  // Structure
  article: 'article',
  section: 'section',
  heading: 'heading',
  region: 'region',
  group: 'group',
  figure: 'figure',
  img: 'img',
  
  // Widgets
  checkbox: 'checkbox',
  radio: 'radio',
  switch: 'switch',
  slider: 'slider',
  spinbutton: 'spinbutton',
  combobox: 'combobox',
  listbox: 'listbox',
  grid: 'grid',
  tree: 'tree',
  treegrid: 'treegrid',
  tooltip: 'tooltip',
};

// ARIA properties
export const ARIA_PROPERTIES = {
  // Widget attributes
  ariaChecked: 'aria-checked',
  ariaDisabled: 'aria-disabled',
  ariaExpanded: 'aria-expanded',
  ariaHasPopup: 'aria-haspopup',
  ariaPressed: 'aria-pressed',
  ariaSelected: 'aria-selected',
  
  // Live region attributes
  ariaAtomic: 'aria-atomic',
  ariaBusy: 'aria-busy',
  ariaLive: 'aria-live',
  ariaRelevant: 'aria-relevant',
  
  // Drag and drop
  ariaDropeffect: 'aria-dropeffect',
  ariaGrabbed: 'aria-grabbed',
  
  // Relationship attributes
  ariaControls: 'aria-controls',
  ariaDescribedby: 'aria-describedby',
  ariaDetails: 'aria-details',
  ariaErrorMessage: 'aria-errormessage',
  ariaFlowto: 'aria-flowto',
  ariaLabelledby: 'aria-labelledby',
  ariaOwns: 'aria-owns',
  
  // Global attributes
  ariaLabel: 'aria-label',
  ariaRoleDescription: 'aria-roledescription',
  
  // Widget attributes
  ariaAutocomplete: 'aria-autocomplete',
  ariaCurrent: 'aria-current',
  ariaKeyshortcuts: 'aria-keyshortcuts',
  ariaModal: 'aria-modal',
  ariaMultiline: 'aria-multiline',
  ariaMultiselectable: 'aria-multiselectable',
  ariaOrientation: 'aria-orientation',
  ariaPlaceholder: 'aria-placeholder',
  ariaReadonly: 'aria-readonly',
  ariaRequired: 'aria-required',
  ariaValuemax: 'aria-valuemax',
  ariaValuemin: 'aria-valuemin',
  ariaValuenow: 'aria-valuenow',
  ariaValuetext: 'aria-valuetext',
};

/**
 * Focus trap utility for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private updateFocusableElements(): void {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => {
      return el.offsetParent !== null || el.getClientRects().length > 0;
    });

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Skip link utility for keyboard users
 */
export function setupSkipLinks(): void {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg focus:rounded';
  skipLink.textContent = 'Skip to main content';
  document.body.prepend(skipLink);

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1');
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
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
 * Generate unique IDs for ARIA relationships
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set ARIA attributes on an element
 */
export function setAriaAttributes(
  element: HTMLElement,
  attributes: Record<string, string | boolean | null>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, String(value));
    }
  });
}

/**
 * Check color contrast ratio for WCAG AA compliance
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const toLinear = (c: number): number => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const R = toLinear(r);
    const G = toLinear(g);
    const B = toLinear(b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const L1 = getLuminance(foreground);
  const L2 = getLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

/**
 * Manage focus for dynamic content
 */
export class FocusManager {
  private focusHistory: HTMLElement[] = [];

  saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
    }
  }

  restoreFocus(): void {
    const previousFocus = this.focusHistory.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  clearHistory(): void {
    this.focusHistory = [];
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNav = {
  /**
   * Handle arrow key navigation
   */
  handleArrowNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onNavigate: (index: number) => void
  ): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = itemCount - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onNavigate(newIndex);
  },

  /**
   * Handle escape key
   */
  handleEscape(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Escape') {
      callback();
    }
  },

  /**
   * Handle enter/space for activation
   */
  handleActivation(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },
};

/**
 * Screen reader only class utility
 */
export function srOnly(): string {
  return 'sr-only';
}

/**
 * Visually hidden but accessible class
 */
export function visuallyHidden(): string {
  return 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0;';
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReaders(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const isHidden = 
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.getAttribute('aria-hidden') === 'true';
  
  return !isHidden;
}

/**
 * Set focus indicator styles
 */
export function setFocusIndicator(element: HTMLElement, visible: boolean): void {
  if (visible) {
    element.style.outline = '2px solid #000';
    element.style.outlineOffset = '2px';
  } else {
    element.style.outline = '';
    element.style.outlineOffset = '';
  }
}

/**
 * Reduce motion preference check
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast mode check
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Dark mode preference check
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check alt text for images
  if (element instanceof HTMLImageElement) {
    return element.alt || '';
  }

  // Check content
  return element.textContent || '';
}

/**
 * Validate form field accessibility
 */
export function validateFormFieldAccessibility(field: HTMLElement): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for label
  const id = field.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (!label) {
      errors.push('Form field missing associated label');
    }
  } else {
    const ariaLabel = field.getAttribute('aria-label');
    const ariaLabelledby = field.getAttribute('aria-labelledby');
    if (!ariaLabel && !ariaLabelledby) {
      errors.push('Form field missing accessible name');
    }
  }

  // Check for required attribute
  if (field.hasAttribute('required')) {
    const ariaRequired = field.getAttribute('aria-required');
    if (ariaRequired !== 'true') {
      errors.push('Required field missing aria-required="true"');
    }
  }

  // Check for invalid state
  if (field.getAttribute('aria-invalid') === 'true') {
    const ariaDescribedby = field.getAttribute('aria-describedby');
    if (!ariaDescribedby) {
      errors.push('Invalid field missing aria-describedby pointing to error message');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create accessible dialog
 */
export function createAccessibleDialog(options: {
  title: string;
  description?: string;
  onClose: () => void;
}): { element: HTMLElement; close: () => void } {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  
  if (options.description) {
    dialog.setAttribute('aria-describedby', 'dialog-description');
  }

  dialog.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 id="dialog-title" class="text-xl font-semibold mb-2">${options.title}</h2>
        ${options.description ? `<p id="dialog-description" class="text-gray-600 mb-4">${options.description}</p>` : ''}
        <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" data-close>Close</button>
      </div>
    </div>
  `;

  const focusTrap = new FocusTrap(dialog);
  
  const close = () => {
    focusTrap.deactivate();
    dialog.remove();
    options.onClose();
  };

  dialog.querySelector('[data-close]')?.addEventListener('click', close);
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  document.body.appendChild(dialog);
  focusTrap.activate();

  return { element: dialog, close };
}
