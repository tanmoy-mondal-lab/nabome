import {
  Bell,
  Check,
  Trash2,
  Settings,
  Filter,
  Package,
  Truck,
  CreditCard,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

import { useNotifications } from '@nabome/customer';
import { useCustomerAccountStore } from '@nabome/customer';
import type {
  CustomerNotification,
  NotificationCategory,
} from '@nabome/customer';
import { Button } from '@nabome/ui';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    markNotificationsRead,
  } = useNotifications();

  const removeNotification = useCustomerAccountStore(
    (s) => s.removeNotification,
  );

  const [selectedCategory, setSelectedCategory] = useState<
    NotificationCategory | 'all'
  >('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationsRead(userId, { notificationIds: [notificationId] });
  };

  const handleMarkAllAsRead = async () => {
    await markNotificationsRead(userId, { markAll: true });
  };

  const handleDelete = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'order_updates':
        return <Package className="w-4 h-4" />;
      case 'shipment_updates':
        return <Truck className="w-4 h-4" />;
      case 'payment_updates':
        return <CreditCard className="w-4 h-4" />;
      case 'promotional':
        return <Tag className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'order_updates':
        return 'bg-blue-100 text-blue-600';
      case 'shipment_updates':
        return 'bg-purple-100 text-purple-600';
      case 'payment_updates':
        return 'bg-green-100 text-green-600';
      case 'promotional':
        return 'bg-orange-100 text-orange-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString('en-IN', { dateStyle: 'short' });
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (
      selectedCategory !== 'all' &&
      notification.category !== selectedCategory
    ) {
      return false;
    }
    if (showUnreadOnly && notification.readAt) {
      return false;
    }
    return true;
  });

  if (notificationsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (notificationsError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {notificationsError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {showPreferences && (
        <div className="p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">
            Notification Preferences
          </h3>
          <div className="space-y-3">
            {(['email', 'sms', 'push', 'in_app'] as const).map((channel) => (
              <div key={channel} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {channel.replace('_', ' ')}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value as NotificationCategory | 'all',
              )
            }
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="order_updates">Order Updates</option>
            <option value="shipment_updates">Shipment Updates</option>
            <option value="payment_updates">Payment Updates</option>
            <option value="promotional">Promotional</option>
            <option value="system">System</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="rounded"
          />
          Unread only
        </label>
      </div>

      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg hover:shadow-sm transition-shadow ${
                !notification.readAt ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${getCategoryColor(notification.category)}`}
                >
                  {getCategoryIcon(notification.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.body}
                  </p>
                  {notification.actionUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto mt-2 text-blue-600"
                      onClick={() => {
                        if (notification.actionUrl)
                          window.open(notification.actionUrl, '_blank');
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  {!notification.readAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
