/**
 * KPI Card Component
 *
 * Displays key performance indicators with trend indicators
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.1
 */

import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { Card } from '@nabome/ui';
import { cn } from '@nabome/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

import type { DashboardKPICard as KPICardProps } from '../types';

export const KPICard = forwardRef<
  HTMLDivElement,
  KPICardProps & HTMLAttributes<HTMLDivElement>
>(
  (
    {
      title,
      value,
      trend,
      comparison,
      icon: Icon,
      loading = false,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const getTrendIcon = () => {
      if (!trend) return null;
      if (trend.direction === 'up') return <ArrowUp className="h-4 w-4" />;
      if (trend.direction === 'down') return <ArrowDown className="h-4 w-4" />;
      return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
      if (!trend) return 'text-(--text-secondary)';
      if (trend.direction === 'up') return 'text-(--color-success-600)';
      if (trend.direction === 'down') return 'text-(--color-error-600)';
      return 'text-(--text-secondary)';
    };

    return (
      <Card
        ref={ref}
        padding="lg"
        interactive={!!onClick}
        className={cn('relative', onClick && 'cursor-pointer', className)}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-(--color-neutral-200) rounded w-1/2 animate-pulse" />
            <div className="h-8 bg-(--color-neutral-200) rounded w-1/3 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-(--text-secondary)">
                {title}
              </p>
              {Icon && (
                <div className="text-(--text-secondary)">
                  <Icon />
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-(--text-primary)">
                {value}
              </p>
              {trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm',
                    getTrendColor(),
                  )}
                >
                  {getTrendIcon()}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            {comparison && (
              <p className="text-xs text-(--text-secondary)">{comparison}</p>
            )}
          </div>
        )}
      </Card>
    );
  },
);

KPICard.displayName = 'KPICard';
