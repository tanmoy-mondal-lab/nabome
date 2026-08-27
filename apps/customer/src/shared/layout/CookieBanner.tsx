import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Cookie Banner component following GDPR/privacy requirements
 *
 * Features:
 * - Shows cookie consent banner
 * - Remembers user choice
 * - Accessible with proper ARIA
 * - Dismissible
 * - Ready for customization with cookie preferences
 */
export function CookieBanner(): ReactNode {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-16 left-4 right-4 z-(--z-tooltip) rounded-lg bg-(--bg-surface) border border-(--border-default) p-4 shadow-lg desktop:bottom-4 desktop:left-4 desktop:right-4"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-4 text-(--text-tertiary) hover:text-(--text-primary)"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <h3
          id="cookie-banner-title"
          className="mb-2 text-sm font-medium text-(--text-primary)"
        >
          Cookie Preferences
        </h3>
        <p
          id="cookie-banner-description"
          className="mb-4 text-xs text-(--text-secondary)"
        >
          We use cookies to enhance your experience. By continuing to visit this
          site, you agree to our use of cookies.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="rounded-md bg-(--bg-brand) px-4 py-2 text-sm font-medium text-(--text-on-brand) transition-colors hover:bg-(--bg-brand-hover)"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="rounded-md border border-(--border-default) bg-(--bg-surface) px-4 py-2 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-subtle)"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
