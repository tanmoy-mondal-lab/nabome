import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from "@/admin/common/StatusBadge";

describe('StatusBadge', () => {
  it('should render with correct classes for known statuses', () => {
    const { rerender } = render(<StatusBadge status="pending" />);
    expect(screen.getByText('pending')).toHaveClass('bg-yellow-50');
    expect(screen.getByText('pending')).toHaveClass('text-yellow-700');
    
    rerender(<StatusBadge status="confirmed" />);
    expect(screen.getByText('confirmed')).toHaveClass('bg-blue-50');
    expect(screen.getByText('confirmed')).toHaveClass('text-blue-700');
    
    rerender(<StatusBadge status="delivered" />);
    expect(screen.getByText('delivered')).toHaveClass('bg-green-50');
    expect(screen.getByText('delivered')).toHaveClass('text-green-700');
    
    rerender(<StatusBadge status="cancelled" />);
    expect(screen.getByText('cancelled')).toHaveClass('bg-red-50');
    expect(screen.getByText('cancelled')).toHaveClass('text-red-700');
  });

  it('should fallback to neutral colors for unknown status', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('unknown status')).toHaveClass('bg-neutral-50');
    expect(screen.getByText('unknown status')).toHaveClass('text-neutral-700');
  });

  it('should replace underscores with spaces', () => {
    render(<StatusBadge status="out_for_delivery" />);
    expect(screen.getByText('out for delivery')).toBeInTheDocument();
  });
});
