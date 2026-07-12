import { useState, useEffect } from "react";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "nabome-cookie-consent";

type ConsentType = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentType>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
        applyConsent(parsed);
      } catch {
        setIsVisible(true);
      }
    }
     
  }, []);

  const applyConsent = (consentData: ConsentType) => {
    if (!consentData.analytics) {
      (window as unknown as Record<string, unknown>)["ga-disable-G-XXXXXXXXXX"] = true;
    }
    // Log consent for GDPR compliance
    void logConsent(consentData);
  };

  const logConsent = async (consentData: ConsentType) => {
    try {
      await fetch("/api/consent/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          necessary: consentData.necessary,
          analytics: consentData.analytics,
          marketing: consentData.marketing,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch {
      // Silently fail - consent logging not critical
    }
  };

  const handleAcceptAll = () => {
    const newConsent = { necessary: true, analytics: true, marketing: true };
    setConsent(newConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    applyConsent(newConsent);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const newConsent = { necessary: true, analytics: false, marketing: false };
    setConsent(newConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    applyConsent(newConsent);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    applyConsent(consent);
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg p-4 md:p-6 md:bottom-0 bottom-[calc(60px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h3 id="cookie-consent-title" className="font-semibold text-lg mb-2">
              Cookie Preferences
            </h3>
            <p id="cookie-consent-description" className="text-sm text-neutral-600 mb-3">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
            {!showSettings ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-brand-500 text-white rounded-md text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-300 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-brand-500 text-sm font-medium hover:underline"
                >
                  Customize
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">Essential Cookies</p>
                    <p className="text-xs text-neutral-500">Required for basic functionality</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.necessary}
                    disabled
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">Analytics Cookies</p>
                    <p className="text-xs text-neutral-500">Help us improve our website</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">Marketing Cookies</p>
                    <p className="text-xs text-neutral-500">Used for advertising and personalization</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.marketing}
                    onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                    className="w-4 h-4 text-brand-500 rounded"
                  />
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 bg-brand-500 text-white rounded-md text-sm font-medium hover:bg-brand-600 transition-colors"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-neutral-600 text-sm font-medium hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="self-start p-1 hover:bg-neutral-100 rounded-md transition-colors"
            aria-label="Close cookie consent"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-3">
          <a href="/privacy" className="hover:underline">Privacy Policy</a> ·{" "}
          <a href="/terms" className="hover:underline">Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
