/**
 * Payment Status Badge Component
 *
 * Displays payment status with appropriate styling and accessibility.
 */

import { getPaymentStatusLabel, getPaymentStatusColor } from '../hooks';
import type { PaymentStatus } from '../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function PaymentStatusBadge({
  status,
  size = 'md',
}: PaymentStatusBadgeProps) {
  const label = getPaymentStatusLabel(status);
  const color = getPaymentStatusColor(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
      aria-label={`Payment status: ${label}`}
    >
      {label}
    </span>
  );
}
