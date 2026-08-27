import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';

import { GuestRoute } from '@/shared/auth/GuestRoute';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';
import { RootLayout } from '@/shared/layout/RootLayout';
import { ForbiddenPage } from '@/shared/pages/ForbiddenPage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { ServerErrorPage } from '@/shared/pages/ServerErrorPage';

type PageModule = { default: ComponentType<unknown> };

/**
 * Code-splits a page module into a React Router lazy definition (RR v7 lazy
 * route modules must expose a named `Component` export).
 */
function lazyPage(
  loader: () => Promise<PageModule>,
): () => Promise<{ Component: ComponentType<unknown> }> {
  return async () => ({ Component: (await loader()).default });
}

/**
 * Route tree — one source of truth (ROUTING_NAVIGATION_USER_FLOW_SPEC §15).
 * Feature routes are code-split via React Router `lazy`. Foundation pages
 * render PlaceholderPage until feature prompts land.
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import('@/features/catalog/pages/HomePage')),
      },
      {
        path: 'shop',
        lazy: lazyPage(() => import('@/features/catalog/pages/ShopPage')),
      },
      {
        path: 'shop/:category',
        lazy: lazyPage(() => import('@/features/catalog/pages/ShopPage')),
      },
      {
        path: 'product/:slug',
        lazy: lazyPage(
          () => import('@/features/catalog/pages/ProductDetailPage'),
        ),
      },
      {
        path: 'search',
        lazy: lazyPage(
          () => import('@/features/catalog/pages/SearchResultsPage'),
        ),
      },
      {
        path: 'cart',
        lazy: lazyPage(() => import('@/features/cart/pages/CartPage')),
      },
      {
        path: 'checkout',
        element: <ProtectedRoute />,
        lazy: lazyPage(() => import('@/features/checkout/pages/CheckoutPage')),
      },
      {
        path: 'order-confirmation/:orderId',
        element: <ProtectedRoute />,
        lazy: lazyPage(
          () => import('@/features/checkout/pages/OrderConfirmationPage'),
        ),
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: 'login',
            lazy: lazyPage(() => import('@/features/account/pages/LoginPage')),
          },
          {
            path: 'register',
            lazy: lazyPage(
              () => import('@/features/account/pages/RegisterPage'),
            ),
          },
        ],
      },
      {
        path: 'account',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(
              () => import('@/features/account/pages/AccountDashboardPage'),
            ),
          },
          {
            path: 'orders',
            lazy: lazyPage(() => import('@/features/account/pages/OrdersPage')),
          },
          {
            path: 'orders/:orderId',
            lazy: lazyPage(
              () => import('@/features/account/pages/OrderDetailPage'),
            ),
          },
          {
            path: 'addresses',
            lazy: lazyPage(
              () => import('@/features/account/pages/AddressBookPage'),
            ),
          },
          {
            path: 'wishlist',
            lazy: lazyPage(
              () => import('@/features/wishlist/pages/WishlistPage'),
            ),
          },
        ],
      },
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
