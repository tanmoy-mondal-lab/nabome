/**
 * Shop Settings Page
 *
 * Settings management page for shop owners
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useEffect, useState } from 'react';

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Users,
  Truck,
  FileText,
  Ticket,
} from 'lucide-react';

import { setDocumentMeta } from '@/lib/seo';
import { Button, Card, Input, Badge } from '@nabome/ui';

import {
  useShopSettings,
  useTaxSettings,
  useNotificationSettings,
  useStaffMembers,
} from '../hooks';

export default function SettingsPage() {
  useEffect(() => {
    setDocumentMeta({ title: 'Settings — নবME Shop' });
  }, []);

  const [activeTab, setActiveTab] = useState('profile');

  const { data: settings } = useShopSettings();
  const { data: taxSettings } = useTaxSettings();
  const { data: notificationSettings } = useNotificationSettings();
  const { data: staffMembers } = useStaffMembers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
          Settings
        </h1>
        <p className="text-sm text-(--text-secondary)">
          Manage your shop configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Truck className="h-4 w-4 inline mr-2" />
          Shipping
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'tax'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Tax
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Payments
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Bell className="h-4 w-4 inline mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Staff
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-md whitespace-nowrap ${
            activeTab === 'coupons'
              ? 'bg-(--color-brand-600) text-white'
              : 'bg-(--color-neutral-100) text-(--text-primary)'
          }`}
        >
          <Ticket className="h-4 w-4 inline mr-2" />
          Coupons
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-6">
            Business Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                Shop Name
              </label>
              <Input
                placeholder="Your shop name"
                defaultValue={settings?.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                Description
              </label>
              <textarea
                className="w-full border rounded-md p-3 min-h-[100px] bg-(--bg-primary) text-(--text-primary)"
                placeholder="Shop description"
                defaultValue={settings?.description}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="contact@shop.com"
                  defaultValue={(settings as any)?.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  defaultValue={settings?.phone}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </label>
              <textarea
                className="w-full border rounded-md p-3 min-h-[80px] bg-(--bg-primary) text-(--text-primary)"
                placeholder="Shop address"
                defaultValue={settings?.address}
              />
            </div>
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>
      )}

      {activeTab === 'shipping' && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-6">
            Shipping Settings
          </h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-(--color-neutral-50)">
              <p className="text-sm text-(--text-secondary)">
                Shipping configuration will be integrated with the existing
                shipping system.
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'tax' && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-6">
            Tax Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                GST Rate (%)
              </label>
              <Input
                type="number"
                placeholder="18"
                defaultValue={(taxSettings as any)?.gstRate}
              />
            </div>
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-6">
            Payment Configuration
          </h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-(--color-neutral-50)">
              <p className="text-sm text-(--text-secondary)">
                Payment configuration will be integrated with Razorpay and
                existing payment system.
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-6">
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-(--text-primary)">
                  Email Notifications
                </p>
                <p className="text-sm text-(--text-secondary)">
                  Receive email alerts for orders
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked={(notificationSettings as any)?.email}
              />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-(--text-primary)">
                  SMS Notifications
                </p>
                <p className="text-sm text-(--text-secondary)">
                  Receive SMS alerts for urgent updates
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked={(notificationSettings as any)?.sms}
              />
            </div>
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>
      )}

      {activeTab === 'staff' && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-(--text-primary)">
              Staff Members
            </h2>
            <Button variant="primary">Add Staff</Button>
          </div>
          <div className="space-y-3">
            {(staffMembers as any)?.staff?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-(--color-brand-100) flex items-center justify-center">
                    <Users className="h-5 w-5 text-(--color-brand-600)" />
                  </div>
                  <div>
                    <p className="font-medium text-(--text-primary)">
                      {member.name}
                    </p>
                    <p className="text-sm text-(--text-secondary)">
                      {member.email}
                    </p>
                  </div>
                </div>
                <Badge variant="info">{member.role}</Badge>
              </div>
            )) || (
              <p className="text-sm text-(--text-secondary)">
                No staff members added
              </p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'coupons' && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-(--text-primary)">
              Coupons & Discounts
            </h2>
            <Button variant="primary">Create Coupon</Button>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-(--color-neutral-50)">
              <p className="text-sm text-(--text-secondary)">
                Create and manage discount coupons for your customers. Coupons
                can be percentage-based or fixed amount discounts.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-(--text-primary)">WELCOME10</p>
                  <p className="text-sm text-(--text-secondary)">
                    10% off first order
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-(--text-primary)">SUMMER25</p>
                  <p className="text-sm text-(--text-secondary)">
                    ₹250 off orders above ₹1000
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">Expired</Badge>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
