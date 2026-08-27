/**
 * Finance Page Tests
 *
 * Unit tests for FinancePage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FinancePage from '../FinancePage';

// Mock the hooks
vi.mock('../hooks', () => ({
  useEarningsSummary: vi.fn(() => ({ data: null, isLoading: false })),
  useSettlements: vi.fn(() => ({ data: [], isLoading: false })),
  useTransactions: vi.fn(() => ({ data: [], isLoading: false })),
  useRefundQueue: vi.fn(() => ({ data: [], isLoading: false })),
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
}));

describe('FinancePage', () => {
  it('renders the page header', () => {
    render(<FinancePage />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(
      screen.getByText('Earnings, settlements, and transactions'),
    ).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<FinancePage />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Settlements')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Refunds')).toBeInTheDocument();
  });

  it('renders earnings summary cards', () => {
    render(<FinancePage />);
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('Commission')).toBeInTheDocument();
    expect(screen.getByText('Net Earnings')).toBeInTheDocument();
    expect(screen.getByText('Pending Settlement')).toBeInTheDocument();
  });

  it('displays zero values when no earnings data', () => {
    render(<FinancePage />);
    expect(screen.getAllByText('₹0')).toHaveLength(4);
  });

  it('switches to settlements tab', async () => {
    render(<FinancePage />);

    const settlementsTab = screen.getByText('Settlements');
    settlementsTab.click();

    await waitFor(() => {
      expect(settlementsTab).toHaveClass('bg-(--color-brand-600)');
    });
  });

  it('shows empty state when no settlements exist', async () => {
    render(<FinancePage />);

    const settlementsTab = screen.getByText('Settlements');
    settlementsTab.click();

    await waitFor(() => {
      expect(screen.getByText('No settlements yet')).toBeInTheDocument();
    });
  });

  it('shows empty state when no transactions exist', async () => {
    render(<FinancePage />);

    const transactionsTab = screen.getByText('Transactions');
    transactionsTab.click();

    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });

  it('shows empty state when no refunds exist', async () => {
    render(<FinancePage />);

    const refundsTab = screen.getByText('Refunds');
    refundsTab.click();

    await waitFor(() => {
      expect(screen.getByText('No refunds pending')).toBeInTheDocument();
    });
  });
});
