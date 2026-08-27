/**
 * CMS Page Tests
 *
 * Unit tests for CmsPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CmsPage from '../CmsPage';

// Mock the hooks
vi.mock('../hooks', () => ({
  useHomepageSections: vi.fn(() => ({ data: [], isLoading: false })),
  useFeaturedProducts: vi.fn(() => ({ data: [], isLoading: false })),
  usePromotionalBanners: vi.fn(() => ({ data: [], isLoading: false })),
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

describe('CmsPage', () => {
  it('renders the page header', () => {
    render(<CmsPage />);
    expect(screen.getByText('CMS')).toBeInTheDocument();
    expect(
      screen.getByText('Manage homepage, featured products, and promotions'),
    ).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<CmsPage />);
    expect(screen.getByText('Homepage')).toBeInTheDocument();
    expect(screen.getByText('Featured Products')).toBeInTheDocument();
    expect(screen.getByText('Promotional Banners')).toBeInTheDocument();
  });

  it('displays homepage tab by default', () => {
    render(<CmsPage />);
    expect(screen.getByText('Homepage Sections')).toBeInTheDocument();
  });

  it('shows empty state when no homepage sections exist', () => {
    render(<CmsPage />);
    expect(
      screen.getByText('No homepage sections configured'),
    ).toBeInTheDocument();
  });

  it('switches to featured products tab', async () => {
    render(<CmsPage />);

    const featuredTab = screen.getByText('Featured Products');
    featuredTab.click();

    await waitFor(() => {
      expect(featuredTab).toHaveClass('bg-(--color-brand-600)');
    });
  });

  it('shows empty state when no featured products exist', async () => {
    render(<CmsPage />);

    const featuredTab = screen.getByText('Featured Products');
    featuredTab.click();

    await waitFor(() => {
      expect(
        screen.getByText('No featured products configured'),
      ).toBeInTheDocument();
    });
  });

  it('switches to promotional banners tab', async () => {
    render(<CmsPage />);

    const bannersTab = screen.getByText('Promotional Banners');
    bannersTab.click();

    await waitFor(() => {
      expect(bannersTab).toHaveClass('bg-(--color-brand-600)');
    });
  });

  it('shows empty state when no promotional banners exist', async () => {
    render(<CmsPage />);

    const bannersTab = screen.getByText('Promotional Banners');
    bannersTab.click();

    await waitFor(() => {
      expect(
        screen.getByText('No promotional banners configured'),
      ).toBeInTheDocument();
    });
  });
});
