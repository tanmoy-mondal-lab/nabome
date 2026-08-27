/**
 * KPI Card Component
 * Source: ADMIN_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { Card } from '@nabome/ui';
import { Text } from '@nabome/ui';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    if (trend.value > 0) return 'text-green-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card padding="md" elevated>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Text size="sm" weight="medium" className="text-gray-600">
          {title}
        </Text>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={`flex items-center text-xs ${getTrendColor()}`}>
              {TrendIcon && <TrendIcon className="mr-1 h-3 w-3" />}
              <span>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
