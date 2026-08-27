/**
 * Top Products Chart Component
 *
 * Horizontal bar chart showing top performing products
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.2
 */

import { useEffect, useRef } from 'react';

import type { TopProductData } from '../types';

interface TopProductsChartProps {
  data: TopProductData[];
  loading?: boolean;
  height?: number;
}

export function TopProductsChart({
  data,
  loading,
  height = 256,
}: TopProductsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || loading || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const chartHeight = height;
    const padding = { top: 20, right: 80, bottom: 20, left: 150 };
    const chartWidth = width - padding.left - padding.right;
    const barHeight =
      (chartHeight - padding.top - padding.bottom) / data.length - 10;
    const maxRevenue = Math.max(...data.map((d) => d.revenue));

    // Draw bars
    data.forEach((product, index) => {
      const y = padding.top + index * (barHeight + 10);
      const barWidth = (product.revenue / maxRevenue) * chartWidth;

      // Draw bar
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(padding.left, y, barWidth, barHeight, 4);
      ctx.fill();

      // Draw product name
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const truncatedName =
        product.name.length > 20
          ? product.name.substring(0, 17) + '...'
          : product.name;
      ctx.fillText(truncatedName, padding.left - 10, y + barHeight / 2);

      // Draw revenue value
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'left';
      ctx.fillText(
        `₹${product.revenue.toLocaleString()}`,
        padding.left + barWidth + 10,
        y + barHeight / 2,
      );

      // Draw sales count
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        `(${product.sales} sold)`,
        padding.left + barWidth + 10,
        y + barHeight / 2 + 12,
      );
    });
  }, [data, loading, height]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-(--color-neutral-50) rounded-lg"
        style={{ height }}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-(--color-neutral-200) rounded w-3/4" />
          <div className="h-4 bg-(--color-neutral-200) rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center bg-(--color-neutral-50) rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-(--text-secondary)">
          No product data available
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
