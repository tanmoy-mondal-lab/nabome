/**
 * Orders by Status Chart Component
 *
 * Donut chart showing order status distribution
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.2
 */

import { useEffect, useRef } from 'react';

import type { OrdersByStatusData } from '../types';

interface OrdersByStatusChartProps {
  data: OrdersByStatusData;
  loading?: boolean;
  size?: number;
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrdersByStatusChart({
  data,
  loading,
  size = 256,
}: OrdersByStatusChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = radius * 0.6;

    // Calculate total
    const total =
      data.pending +
      data.processing +
      data.shipped +
      data.delivered +
      data.cancelled;

    if (total === 0) {
      // Draw empty state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 20;
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No orders', centerX, centerY);
      return;
    }

    // Draw donut chart
    let startAngle = -Math.PI / 2;
    const statusEntries = [
      { key: 'pending', value: data.pending },
      { key: 'processing', value: data.processing },
      { key: 'shipped', value: data.shipped },
      { key: 'delivered', value: data.delivered },
      { key: 'cancelled', value: data.cancelled },
    ];

    statusEntries.forEach((entry) => {
      if (entry.value === 0) return;

      const sliceAngle = (entry.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = STATUS_COLORS[entry.key as keyof typeof STATUS_COLORS];
      ctx.fill();

      startAngle = endAngle;
    });

    // Draw center text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.fillText('Total Orders', centerX, centerY + 14);

    // Draw legend
    const legendX = 20;
    let legendY = height - 20;
    const legendItemHeight = 20;

    statusEntries.forEach((entry) => {
      if (entry.value === 0) return;

      ctx.fillStyle = STATUS_COLORS[entry.key as keyof typeof STATUS_COLORS];
      ctx.fillRect(legendX, legendY - 6, 12, 12);

      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const label = `${STATUS_LABELS[entry.key as keyof typeof STATUS_LABELS]} (${entry.value})`;
      ctx.fillText(label, legendX + 18, legendY);

      legendY -= legendItemHeight;
    });
  }, [data, loading, size]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-(--color-neutral-50) rounded-lg"
        style={{ height: size }}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-(--color-neutral-200) rounded w-3/4" />
          <div className="h-4 bg-(--color-neutral-200) rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: size }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: `${size}px` }}
      />
    </div>
  );
}
