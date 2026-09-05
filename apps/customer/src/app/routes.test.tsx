import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, it, expect } from 'vitest';

import { routes } from './routes';

async function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

async function expectNotFound(path: string) {
  await renderAt(path);
  await waitFor(() => {
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });
}

async function expectNoNotFound(path: string) {
  await renderAt(path);
  await waitFor(
    () => {
      const body = document.body.textContent ?? '';
      expect(body.length).toBeGreaterThan(0);
      expect(screen.queryByText('Page not found')).not.toBeInTheDocument();
    },
    { timeout: 10000 },
  );
}

describe('customer route tree', () => {
  it.each([
    '/',
    '/shop',
    '/shop/sale',
    '/search',
    '/login',
    '/register',
    '/cart',
    '/about',
    '/careers',
    '/press',
    '/sustainability',
    '/help/contact',
    '/help/shipping',
    '/help/returns',
    '/help/faq',
    '/legal/terms',
    '/legal/privacy',
    '/legal/cookies',
    '/legal/refunds',
  ])('public route %s does not render NotFound', async (path) => {
    await expectNoNotFound(path);
  });

  it.each([
    '/wishlist',
    '/checkout',
    '/order-confirmation/o1',
    '/account',
    '/account/orders',
    '/account/orders/o1',
    '/account/addresses',
    '/account/wishlist',
    '/account/payments',
    '/account/settings',
    '/account/returns',
  ])(
    'protected route %s redirects guest to login (never NotFound)',
    async (path) => {
      await renderAt(path);
      await waitFor(
        () => {
          expect(screen.queryByText('Page not found')).not.toBeInTheDocument();
          expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
        },
        { timeout: 10000 },
      );
    },
  );

  it.each([
    '/categories',
    '/products',
    '/products/some-slug',
    '/account/login',
    '/forgot-password',
    '/account/orders/o1/cancel',
    '/account/orders/o1/return',
    '/nonexistent-xyz-123',
  ])('unknown route %s renders NotFound', async (path) => {
    await expectNotFound(path);
  });
});
