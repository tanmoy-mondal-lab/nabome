import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import { Header } from '../Header';

vi.mock('@/stores/cart-store', () => ({
  useCartStore: vi.fn((selector?: any) => {
    const state = {
      items: [],
      cart: { items: [] },
      isLoading: false,
      getTotalItems: () => 0,
    };
    return selector ? selector(state) : state;
  }),
}));
vi.mock('@/stores/wishlist-store', () => ({
  useWishlistStore: vi.fn((selector?: any) => {
    const state = { items: [], isLoading: false, getCount: () => 0 };
    return selector ? selector(state) : state;
  }),
}));
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = { user: null, isAuthenticated: false };
    return selector ? selector(state) : state;
  }),
}));

describe('Header', () => {
  it('renders brand logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    expect(screen.getByText('নবME')).toBeInTheDocument();
  });

  it('renders navigation links on desktop', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    expect(screen.getAllByText('Shop').length).toBeGreaterThanOrEqual(1);
  });

  it('opens mobile menu when hamburger is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('opens search overlay when search icon is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    const searchButton = screen.getByLabelText('Search');
    fireEvent.click(searchButton);
    expect(
      screen.getByPlaceholderText('Search products...'),
    ).toBeInTheDocument();
  });

  it('has skip navigation link for accessibility', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('sr-only');
  });
});
