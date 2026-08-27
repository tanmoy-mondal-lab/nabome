/**
 * Activity Feed Component
 * Source: ADMIN_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { Card } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Stack } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Button } from '@nabome/ui';
import { ArrowRight } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'shop' | 'product' | 'order' | 'payment' | 'security' | 'system';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  priority?: 'high' | 'medium' | 'low';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  loading?: boolean;
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  loading,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <Card padding="lg" elevated>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (displayedActivities.length === 0) {
    return (
      <Card padding="lg" elevated>
        <Heading level="h3" className="mb-4">
          Recent Activity
        </Heading>
        <Text size="sm" className="text-gray-500">
          No recent activity
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="lg" elevated>
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3">Recent Activity</Heading>
        {activities.length > maxItems && (
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Stack gap="md">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div
              className={`mt-1 h-2 w-2 rounded-full ${getPriorityColor(activity.priority)}`}
            />
            <div className="flex-1">
              <Text size="sm" weight="medium">
                {activity.title}
              </Text>
              <Text size="xs" className="text-gray-500">
                {formatRelativeTime(activity.timestamp)} by {activity.actor}
              </Text>
            </div>
            {activity.priority === 'high' && (
              <Badge variant="warning">High</Badge>
            )}
          </div>
        ))}
      </Stack>
    </Card>
  );
}
