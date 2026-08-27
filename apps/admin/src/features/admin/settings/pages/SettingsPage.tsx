/**
 * Platform Settings Page
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 * Features: Global, Tax, Commission, Shipping Defaults, Payment Provider, CMS Defaults, Notification Templates, Feature Flags
 */

import { useState } from 'react';

import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Button } from '@nabome/ui';
import {
  Globe,
  Percent,
  Truck,
  CreditCard,
  Layout,
  Bell,
  ToggleLeft,
  Save,
  Loader2,
} from 'lucide-react';

import {
  useGlobalSettings,
  useTaxSettings,
  useCommissionSettings,
  useShippingSettings,
  usePaymentSettings,
  useCMSSettings,
  useNotificationSettings,
  useFeatureFlags,
  useUpdateGlobalSettings,
  useUpdateFeatureFlag,
} from '../hooks/useSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    | 'global'
    | 'tax'
    | 'commission'
    | 'shipping'
    | 'payment'
    | 'cms'
    | 'notifications'
    | 'features'
  >('global');

  const { data: globalSettings, isLoading: globalLoading } =
    useGlobalSettings();
  const { data: taxSettings, isLoading: taxLoading } = useTaxSettings();
  const { data: commissionSettings, isLoading: commissionLoading } =
    useCommissionSettings();
  const { data: shippingSettings, isLoading: shippingLoading } =
    useShippingSettings();
  const { data: paymentSettings, isLoading: paymentLoading } =
    usePaymentSettings();
  const { data: cmsSettings, isLoading: cmsLoading } = useCMSSettings();
  const { data: notificationSettings, isLoading: notificationLoading } =
    useNotificationSettings();
  const { data: featureFlags, isLoading: flagsLoading } = useFeatureFlags();

  const updateGlobalSettings = useUpdateGlobalSettings();
  const updateFeatureFlag = useUpdateFeatureFlag();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Platform Settings</Heading>
          <Text size="sm" className="text-gray-600">
            Configure global platform settings, taxes, commissions, and feature
            flags
          </Text>
        </div>
        <Button variant="primary">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('global')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'global'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tax
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'commission'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Commission
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Shipping
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'payment'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payment
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'cms'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            CMS
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Feature Flags
          </button>
        </div>
      </div>

      {/* Global Tab */}
      {activeTab === 'global' && (
        <Card padding="lg" elevated>
          {globalLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : globalSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Global Settings</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Settings: {JSON.stringify(globalSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Global Settings</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Tax Tab */}
      {activeTab === 'tax' && (
        <Card padding="lg" elevated>
          {taxLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : taxSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Percent className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Tax Configuration</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Tax settings: {JSON.stringify(taxSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Percent className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Tax Configuration</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Commission Tab */}
      {activeTab === 'commission' && (
        <Card padding="lg" elevated>
          {commissionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : commissionSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Percent className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Commission Rates</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Commission settings: {JSON.stringify(commissionSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Percent className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Commission Rates</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Shipping Tab */}
      {activeTab === 'shipping' && (
        <Card padding="lg" elevated>
          {shippingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : shippingSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Shipping Defaults</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Shipping settings: {JSON.stringify(shippingSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Truck className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Shipping Defaults</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <Card padding="lg" elevated>
          {paymentLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : paymentSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Payment Provider</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Payment settings: {JSON.stringify(paymentSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Payment Provider</Heading>
            </div>
          )}
        </Card>
      )}

      {/* CMS Tab */}
      {activeTab === 'cms' && (
        <Card padding="lg" elevated>
          {cmsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : cmsSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Layout className="h-5 w-5 text-brand-500" />
                <Heading level="h3">CMS Defaults</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                CMS settings: {JSON.stringify(cmsSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Layout className="h-5 w-5 text-brand-500" />
              <Heading level="h3">CMS Defaults</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card padding="lg" elevated>
          {notificationLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : notificationSettings ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Notification Templates</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Notification settings: {JSON.stringify(notificationSettings)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Notification Templates</Heading>
            </div>
          )}
        </Card>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <Card padding="lg" elevated>
          {flagsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : featureFlags ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <ToggleLeft className="h-5 w-5 text-brand-500" />
                <Heading level="h3">Feature Flags</Heading>
              </div>
              <Text size="sm" className="text-gray-500">
                Feature flags: {JSON.stringify(featureFlags)}
              </Text>
            </div>
          ) : (
            <div className="flex items-center space-x-3 mb-4">
              <ToggleLeft className="h-5 w-5 text-brand-500" />
              <Heading level="h3">Feature Flags</Heading>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
