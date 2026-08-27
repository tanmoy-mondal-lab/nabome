import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * TrackingTimeline — displays shipment tracking timeline (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with accessible navigation.
 */

export const trackingTimelineVariants = cva('space-y-4', {
  variants: {
    compact: {
      true: 'space-y-2',
    },
  },
  defaultVariants: {
    compact: false,
  },
});

export interface TrackingTimelineProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trackingTimelineVariants> {}

export const TrackingTimeline = forwardRef<
  HTMLDivElement,
  TrackingTimelineProps
>(({ className, compact, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(trackingTimelineVariants({ compact }), className)}
      role="list"
      aria-label="Tracking timeline"
      {...props}
    >
      {children}
    </div>
  );
});
TrackingTimeline.displayName = 'TrackingTimeline';

/**
 * TrackingEventItem — individual tracking event in timeline
 */

export const trackingEventItemVariants = cva('relative flex gap-4', {
  variants: {
    status: {
      current: 'font-medium',
      completed: 'text-(--text-muted)',
      pending: 'text-(--text-muted)',
    },
  },
  defaultVariants: {
    status: 'completed',
  },
});

export interface TrackingEventItemProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trackingEventItemVariants> {
  date?: string;
  location?: string;
  description: string;
  isLast?: boolean;
}

export const TrackingEventItem = forwardRef<
  HTMLDivElement,
  TrackingEventItemProps
>(
  (
    {
      className,
      status,
      date,
      location,
      description,
      isLast = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(trackingEventItemVariants({ status }), className)}
        role="listitem"
        {...props}
      >
        {/* Timeline indicator */}
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'h-3 w-3 rounded-full border-2',
              status === 'current'
                ? 'border-(--primary) bg-(--primary)'
                : status === 'completed'
                  ? 'border-(--success) bg-(--success)'
                  : 'border-(--border) bg-(--bg)',
            )}
          />
          {!isLast && (
            <div className="absolute top-3 h-full w-px bg-(--border)" />
          )}
        </div>

        {/* Event details */}
        <div className="flex-1 pb-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">{description}</p>
            {date && <p className="text-xs text-(--text-muted)">{date}</p>}
          </div>
          {location && (
            <p className="text-xs text-(--text-muted)">{location}</p>
          )}
        </div>
      </div>
    );
  },
);
TrackingEventItem.displayName = 'TrackingEventItem';
