/**
 * Preferences Center Component
 *
 * Displays customer's preferences for theme, language, communication, privacy, and marketing.
 * Mobile-first, accessible, and follows the official component library.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: FRONTEND_APPLICATION_IMPLEMENTATION_SPECIFICATION.md (binding)
 */

import { Palette, Globe, Mail, Shield, Megaphone, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useCustomerPreferences } from '@nabome/customer';
import type { CustomerPreferences, Theme } from '@nabome/customer';
import { Button } from '@nabome/ui';

interface PreferencesCenterProps {
  userId: string;
}

export function PreferencesCenter({ userId }: PreferencesCenterProps) {
  const {
    preferences,
    preferencesLoading,
    preferencesError,
    updatePreferences,
    updateTheme,
    fetchPreferences,
  } = useCustomerPreferences();

  const [localPreferences, setLocalPreferences] =
    useState<CustomerPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [localeSaving, setLocaleSaving] = useState(false);

  useEffect(() => {
    fetchPreferences(userId);
  }, [userId, fetchPreferences]);

  const handleSave = async () => {
    if (!localPreferences) return;
    setSaving(true);
    try {
      await updatePreferences(userId, localPreferences);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (theme: Theme) => {
    await updateTheme(theme);
  };

  const handleLocaleChange = async (locale: 'en-IN' | 'bn-IN' | 'hi-IN') => {
    if (!localPreferences) return;

    // Store previous locale for rollback
    const previousLocale = localPreferences.locale;

    // Update local state immediately for UI responsiveness
    setLocalPreferences({
      ...localPreferences,
      locale,
    });

    // Persist the change immediately
    setLocaleSaving(true);
    try {
      await updatePreferences(userId, {
        ...localPreferences,
        theme: localPreferences.theme || 'light',
        locale,
      });
    } catch (error) {
      console.error('Failed to update locale preference:', error);
      // Rollback to previous locale on failure
      setLocalPreferences({
        ...localPreferences,
        locale: previousLocale,
      });
      alert('Failed to update language preference. Please try again.');
    } finally {
      setLocaleSaving(false);
    }
  };

  if (preferencesLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (preferencesError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {preferencesError}
      </div>
    );
  }

  const currentPreferences = localPreferences || preferences;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>

      {/* Theme */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Theme</h3>
        </div>
        <div className="flex gap-3">
          {(['light', 'dark', 'auto'] as Theme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                currentPreferences?.theme === theme
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Language</h3>
        </div>
        <div className="flex gap-3">
          {[
            { code: 'en-IN', name: 'English' },
            { code: 'bn-IN', name: 'বাংলা (Bengali)' },
            { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
          ].map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleLocaleChange(locale.code as any)}
              disabled={localeSaving}
              className={`px-4 py-2 rounded-lg border-2 transition-colors relative ${
                currentPreferences?.locale === locale.code
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              } ${localeSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {localeSaving && currentPreferences?.locale !== locale.code ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                locale.name
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Communication</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'emailEnabled', label: 'Email Notifications' },
            { key: 'smsEnabled', label: 'SMS Notifications' },
            { key: 'pushEnabled', label: 'Push Notifications' },
            { key: 'inAppEnabled', label: 'In-App Notifications' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    currentPreferences?.communication[
                      item.key as keyof typeof currentPreferences.communication
                    ] as boolean
                  }
                  onChange={(e) => {
                    if (!currentPreferences) return;
                    setLocalPreferences({
                      ...currentPreferences,
                      theme: currentPreferences.theme || 'light',
                      locale: currentPreferences.locale || 'en-IN',
                      communication: {
                        ...currentPreferences.communication,
                        [item.key]: e.target.checked,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Preferences */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Privacy</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'profileVisibility', label: 'Profile Visibility' },
            { key: 'showActivityStatus', label: 'Show Activity Status' },
            { key: 'allowAnalytics', label: 'Allow Analytics' },
            { key: 'allowPersonalization', label: 'Allow Personalization' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    currentPreferences?.privacy[
                      item.key as keyof typeof currentPreferences.privacy
                    ] as boolean
                  }
                  onChange={(e) => {
                    if (!currentPreferences) return;
                    setLocalPreferences({
                      ...currentPreferences,
                      theme: currentPreferences.theme || 'light',
                      locale: currentPreferences.locale || 'en-IN',
                      privacy: {
                        ...currentPreferences.privacy,
                        [item.key]: e.target.checked,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Marketing</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'emailConsent', label: 'Email Marketing' },
            { key: 'smsConsent', label: 'SMS Marketing' },
            { key: 'pushConsent', label: 'Push Marketing' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    currentPreferences?.marketing[
                      item.key as keyof typeof currentPreferences.marketing
                    ] as boolean
                  }
                  onChange={(e) => {
                    if (!currentPreferences) return;
                    setLocalPreferences({
                      ...currentPreferences,
                      theme: currentPreferences.theme || 'light',
                      locale: currentPreferences.locale || 'en-IN',
                      marketing: {
                        ...currentPreferences.marketing,
                        [item.key]: e.target.checked,
                      },
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
