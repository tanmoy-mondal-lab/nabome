/**
 * Activity Feed Component
 *
 * Displays recent activity events for the shop
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.8
 */

import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { Card } from '@nabome/ui';
import { cn } from '@nabome/utils';
import {
  ShoppingCart,
  IndianRupee,
  Package,
  CreditCard,
  AlertTriangle,
  Settings,
} from 'lucide-react';

import type { ActivityEvent } from '../types';

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const iconMap = {
  order: ShoppingCart,
  payment: IndianRupee,
  product: Package,
  settlement: CreditCard,
  inventory: AlertTriangle,
  system: Settings,
};

export interface ActivityFeedProps extends HTMLAttributes<HTMLDivElement> {
  activities: ActivityEvent[];
  maxItems?: number;
  loading?: boolean;
}

export const ActivityFeed = forwardRef<HTMLDivElement, ActivityFeedProps>(
  (
    { activities, maxItems = 10, loading = false, className, ...props },
    ref,
  ) => {
    const displayActivities = activities.slice(0, maxItems);

    if (loading) {
      return (
        <Card ref={ref} padding="lg" className={cn(className)} {...props}>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-(--color-neutral-200)" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-(--color-neutral-200) rounded w-3/4" />
                  <div className="h-3 bg-(--color-neutral-200) rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (displayActivities.length === 0) {
      return (
        <Card ref={ref} padding="lg" className={cn(className)} {...props}>
          <div className="text-center py-8">
            <p className="text-sm text-(--text-secondary)">
              No recent activity
            </p>
          </div>
        </Card>
      );
    }

    return (
      <Card ref={ref} padding="lg" className={cn(className)} {...props}>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = activity.icon
              ? iconMap[activity.icon as keyof typeof iconMap]
              : null;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 group cursor-pointer hover:bg-(--color-neutral-50) rounded-lg p-2 -mx-2 transition-colors"
              >
                {Icon && (
                  <div className="h-8 w-8 rounded-full bg-(--color-brand-50) flex items-center justify-center flex-shrink-0">
                    <div className="text-(--color-brand-600)">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--text-primary) truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-(--text-secondary) mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  },
);

ActivityFeed.displayName = 'ActivityFeed';
