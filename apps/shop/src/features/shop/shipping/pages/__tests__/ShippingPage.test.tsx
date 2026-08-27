/**
 * Shipping Page Tests
 *
 * Unit tests for ShippingPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ShippingPage from '../ShippingPage';

// Mock the hooks
vi.mock('../hooks', () => ({
  useShipments: vi.fn(() => ({ data: [], isLoading: false })),
  useCarrierRates: vi.fn(() => ({ data: [], isLoading: false })),
  useFulfillmentQueue: vi.fn(() => ({ data: [], isLoading: false })),
}));

// Mock the SEO library
vi.mock('@/lib/seo', () => ({
  setDocumentMeta: vi.fn(),
}));

// Mock the UI components
vi.mock('@nabome/ui', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Card: ({ children, padding, ...props }: any) => (
    <div {...props} style={{ padding: padding === 'lg' ? '1.5rem' : '1rem' }}>
      {children}
    </div>
  ),
  Badge: ({ children, variant, ...props }: any) => (
    <span {...props} data-variant={variant}>
      {children}
    </span>
  ),
  Table: ({ children, variant, ...props }: any) => (
    <table {...props} data-variant={variant}>
      {children}
    </table>
  ),
  Input: (props: any) => <input {...props} />,
}));

describe('ShippingPage', () => {
  it('renders the page header', () => {
    render(<ShippingPage />);
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(
      screen.getByText('Manage shipments, tracking, and fulfillment'),
    ).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<ShippingPage />);
    expect(screen.getByText('Shipments')).toBeInTheDocument();
    expect(screen.getByText('Fulfillment Queue')).toBeInTheDocument();
    expect(screen.getByText('Carriers')).toBeInTheDocument();
  });

  it('switches tabs when clicked', async () => {
    render(<ShippingPage />);

    const fulfillmentTab = screen.getByText('Fulfillment Queue');
    fulfillmentTab.click();

    await waitFor(() => {
      expect(fulfillmentTab).toHaveClass('bg-(--color-brand-600)');
    });
  });

  it('displays shipments tab by default', () => {
    render(<ShippingPage />);
    expect(
      screen.getByPlaceholderText(
        'Search shipments by tracking number or order ID...',
      ),
    ).toBeInTheDocument();
  });

  it('shows loading state when shipments are loading', async () => {
    const hooks = await import('../hooks');
    vi.mocked(hooks.useShipments).mockReturnValueOnce({
      data: null,
      isLoading: true,
    } as any);

    render(<ShippingPage />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no shipments exist', () => {
    render(<ShippingPage />);
    expect(screen.getByText('No shipments found')).toBeInTheDocument();
  });

  it('shows empty state when no fulfillment items exist', async () => {
    render(<ShippingPage />);

    const fulfillmentTab = screen.getByText('Fulfillment Queue');
    fulfillmentTab.click();

    await waitFor(() => {
      expect(
        screen.getByText('No items in fulfillment queue'),
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no carriers exist', async () => {
    render(<ShippingPage />);

    const carriersTab = screen.getByText('Carriers');
    carriersTab.click();

    await waitFor(() => {
      expect(screen.getByText('No carriers configured')).toBeInTheDocument();
    });
  });
});
