import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

import { Badge } from './Badge';
import { Card } from './Card';
import { Heading } from './Heading';
import { Paragraph } from './Paragraph';
import { TrackingTimeline, TrackingEventItem } from './TrackingTimeline';

/**
 * TrackingPage — complete tracking page for customers (SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md).
 * Mobile-first responsive design with accessible timeline.
 */

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface TrackingPageProps extends HTMLAttributes<HTMLDivElement> {
  shipmentId: string;
  trackingNumber: string;
  currentStatus: string;
  carrier?: string;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
}

export const TrackingPage = forwardRef<HTMLDivElement, TrackingPageProps>(
  (
    {
      className,
      shipmentId,
      trackingNumber,
      currentStatus,
      carrier,
      estimatedDelivery,
      events,
      ...props
    },
    ref,
  ) => {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getEventStatus = (index: number, total: number) => {
      if (index === 0) return 'current';
      if (index < total) return 'completed';
      return 'pending';
    };

    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Header */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Heading level="h3" className="text-lg">
                  Shipment #{shipmentId}
                </Heading>
                <Paragraph className="text-sm text-(--text-muted)">
                  Order #{trackingNumber}
                </Paragraph>
              </div>
              <Badge variant="info">
                {currentStatus
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>

            {carrier && (
              <div className="flex items-center justify-between">
                <Paragraph className="text-sm text-(--text-muted)">
                  Carrier
                </Paragraph>
                <Paragraph className="text-sm font-medium">{carrier}</Paragraph>
              </div>
            )}

            {estimatedDelivery && (
              <div className="flex items-center justify-between">
                <Paragraph className="text-sm text-(--text-muted)">
                  Estimated Delivery
                </Paragraph>
                <Paragraph className="text-sm font-medium">
                  {formatDate(estimatedDelivery)}
                </Paragraph>
              </div>
            )}
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <Heading level="h4" className="mb-4">
            Tracking Timeline
          </Heading>
          <TrackingTimeline>
            {events.map((event, index) => (
              <TrackingEventItem
                key={event.id}
                status={getEventStatus(index, events.length)}
                date={formatDate(event.timestamp)}
                location={event.location}
                description={event.description}
                isLast={index === events.length - 1}
              />
            ))}
          </TrackingTimeline>
        </Card>
      </div>
    );
  },
);
TrackingPage.displayName = 'TrackingPage';
