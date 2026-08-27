/**
 * Revenue Trend Chart Component
 *
 * Line chart showing revenue over time
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md §2.2.2
 */

import { useEffect, useRef } from 'react';

import type { RevenueChartData } from '../types';

interface RevenueTrendChartProps {
  data: RevenueChartData;
  loading?: boolean;
  height?: number;
}

export function RevenueTrendChart({
  data,
  loading,
  height = 256,
}: RevenueTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || loading || !data.data.length) return;

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
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartInnerHeight = chartHeight - padding.top - padding.bottom;

    // Find max value for scaling
    const maxValue = Math.max(...data.data.map((d) => d.value));
    const minValue = Math.min(...data.data.map((d) => d.value));
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartInnerHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Draw Y-axis labels
      const value = maxValue - (valueRange / 4) * i;
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${value.toLocaleString()}`, padding.left - 10, y + 4);
    }

    // Draw line chart
    if (data.data.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      data.data.forEach((point, index) => {
        const x = padding.left + (chartWidth / (data.data.length - 1)) * index;
        const y =
          padding.top +
          chartInnerHeight -
          ((point.value - minValue) / valueRange) * chartInnerHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(
        0,
        padding.top,
        0,
        chartHeight - padding.bottom,
      );
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

      ctx.lineTo(padding.left + chartWidth, chartHeight - padding.bottom);
      ctx.lineTo(padding.left, chartHeight - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw data points
      data.data.forEach((point, index) => {
        const x = padding.left + (chartWidth / (data.data.length - 1)) * index;
        const y =
          padding.top +
          chartInnerHeight -
          ((point.value - minValue) / valueRange) * chartInnerHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw X-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    const labelInterval = Math.ceil(data.data.length / 6);
    data.data.forEach((point, index) => {
      if (index % labelInterval === 0) {
        const x = padding.left + (chartWidth / (data.data.length - 1)) * index;
        ctx.fillText(point.label, x, chartHeight - 10);
      }
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

  if (!data.data.length) {
    return (
      <div
        className="flex items-center justify-center bg-(--color-neutral-50) rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-(--text-secondary)">
          No revenue data available
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
