/**
 * Accessibility Utilities
 * Provides utilities for WCAG AA compliance, ARIA attributes, keyboard navigation, focus management, and screen reader support.
 */
export declare const ARIA_ROLES: {
    navigation: string;
    main: string;
    complementary: string;
    contentinfo: string;
    banner: string;
    button: string;
    link: string;
    menu: string;
    menuitem: string;
    tab: string;
    tablist: string;
    tabpanel: string;
    form: string;
    search: string;
    alert: string;
    dialog: string;
    alertdialog: string;
    status: string;
    log: string;
    progressbar: string;
    marquee: string;
    timer: string;
    article: string;
    section: string;
    heading: string;
    region: string;
    group: string;
    figure: string;
    img: string;
    checkbox: string;
    radio: string;
    switch: string;
    slider: string;
    spinbutton: string;
    combobox: string;
    listbox: string;
    grid: string;
    tree: string;
    treegrid: string;
    tooltip: string;
};
export declare const ARIA_PROPERTIES: {
    ariaChecked: string;
    ariaDisabled: string;
    ariaExpanded: string;
    ariaHasPopup: string;
    ariaPressed: string;
    ariaSelected: string;
    ariaAtomic: string;
    ariaBusy: string;
    ariaLive: string;
    ariaRelevant: string;
    ariaDropeffect: string;
    ariaGrabbed: string;
    ariaControls: string;
    ariaDescribedby: string;
    ariaDetails: string;
    ariaErrorMessage: string;
    ariaFlowto: string;
    ariaLabelledby: string;
    ariaOwns: string;
    ariaLabel: string;
    ariaRoleDescription: string;
    ariaAutocomplete: string;
    ariaCurrent: string;
    ariaKeyshortcuts: string;
    ariaModal: string;
    ariaMultiline: string;
    ariaMultiselectable: string;
    ariaOrientation: string;
    ariaPlaceholder: string;
    ariaReadonly: string;
    ariaRequired: string;
    ariaValuemax: string;
    ariaValuemin: string;
    ariaValuenow: string;
    ariaValuetext: string;
};
/**
 * Focus trap utility for modals and dialogs
 */
export declare class FocusTrap {
    private container;
    private previousActiveElement;
    private focusableElements;
    private firstFocusableElement;
    private lastFocusableElement;
    constructor(container: HTMLElement);
    activate(): void;
    deactivate(): void;
    private updateFocusableElements;
    private handleKeyDown;
}
/**
 * Skip link utility for keyboard users
 */
export declare function setupSkipLinks(): void;
/**
 * Announce messages to screen readers
 */
export declare function announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;
/**
 * Generate unique IDs for ARIA relationships
 */
export declare function generateId(prefix: string): string;
/**
 * Set ARIA attributes on an element
 */
export declare function setAriaAttributes(element: HTMLElement, attributes: Record<string, string | boolean | null>): void;
/**
 * Check color contrast ratio for WCAG AA compliance
 */
export declare function checkColorContrast(foreground: string, background: string): {
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
};
/**
 * Manage focus for dynamic content
 */
export declare class FocusManager {
    private focusHistory;
    saveFocus(): void;
    restoreFocus(): void;
    clearHistory(): void;
}
/**
 * Keyboard navigation utilities
 */
export declare const KeyboardNav: {
    /**
     * Handle arrow key navigation
     */
    handleArrowNavigation(event: KeyboardEvent, currentIndex: number, itemCount: number, onNavigate: (index: number) => void): void;
    /**
     * Handle escape key
     */
    handleEscape(event: KeyboardEvent, callback: () => void): void;
    /**
     * Handle enter/space for activation
     */
    handleActivation(event: KeyboardEvent, callback: () => void): void;
};
/**
 * Screen reader only class utility
 */
export declare function srOnly(): string;
/**
 * Visually hidden but accessible class
 */
export declare function visuallyHidden(): string;
/**
 * Check if element is visible to screen readers
 */
export declare function isVisibleToScreenReaders(element: HTMLElement): boolean;
/**
 * Set focus indicator styles
 */
export declare function setFocusIndicator(element: HTMLElement, visible: boolean): void;
/**
 * Reduce motion preference check
 */
export declare function prefersReducedMotion(): boolean;
/**
 * High contrast mode check
 */
export declare function prefersHighContrast(): boolean;
/**
 * Dark mode preference check
 */
export declare function prefersDarkMode(): boolean;
/**
 * Get accessible name for an element
 */
export declare function getAccessibleName(element: HTMLElement): string;
/**
 * Validate form field accessibility
 */
export declare function validateFormFieldAccessibility(field: HTMLElement): {
    valid: boolean;
    errors: string[];
};
/**
 * Create accessible dialog
 */
export declare function createAccessibleDialog(options: {
    title: string;
    description?: string;
    onClose: () => void;
}): {
    element: HTMLElement;
    close: () => void;
};
