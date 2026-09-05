import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';

import { GuestRoute } from '@/shared/auth/GuestRoute';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';
import { PlaceholderPage } from '@/shared/feedback/PlaceholderPage';
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
export const routes: RouteObject[] = [
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
        children: [
          {
            index: true,
            lazy: lazyPage(
              () => import('@/features/checkout/pages/CheckoutPage'),
            ),
          },
        ],
      },
      {
        path: 'order-confirmation/:orderId',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(
              () => import('@/features/checkout/pages/OrderConfirmationPage'),
            ),
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: 'login',
            children: [
              {
                index: true,
                lazy: lazyPage(
                  () => import('@/features/account/pages/LoginPage'),
                ),
              },
            ],
          },
          {
            path: 'register',
            children: [
              {
                index: true,
                lazy: lazyPage(
                  () => import('@/features/account/pages/RegisterPage'),
                ),
              },
            ],
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
          {
            path: 'payments',
            element: (
              <PlaceholderPage
                title="Payments"
                description="Saved payment methods are coming soon."
              />
            ),
          },
          {
            path: 'settings',
            element: (
              <PlaceholderPage
                title="Settings"
                description="Account settings are coming soon."
              />
            ),
          },
          {
            path: 'returns',
            element: (
              <PlaceholderPage
                title="Returns"
                description="Return management is coming soon."
              />
            ),
          },
        ],
      },
      {
        path: 'wishlist',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(
              () => import('@/features/wishlist/pages/WishlistPage'),
            ),
          },
        ],
      },
      {
        path: 'about',
        element: (
          <PlaceholderPage
            title="About Us"
            description="Learn more about নবME soon."
          />
        ),
      },
      {
        path: 'careers',
        element: (
          <PlaceholderPage title="Careers" description="Join our team soon." />
        ),
      },
      {
        path: 'press',
        element: (
          <PlaceholderPage
            title="Press"
            description="Press resources are coming soon."
          />
        ),
      },
      {
        path: 'sustainability',
        element: (
          <PlaceholderPage
            title="Sustainability"
            description="Our sustainability story is coming soon."
          />
        ),
      },
      {
        path: 'help/contact',
        element: (
          <PlaceholderPage
            title="Contact Us"
            description="Customer support contact options are coming soon."
          />
        ),
      },
      {
        path: 'help/shipping',
        element: (
          <PlaceholderPage
            title="Shipping & Delivery"
            description="Shipping and delivery information is coming soon."
          />
        ),
      },
      {
        path: 'help/returns',
        element: (
          <PlaceholderPage
            title="Returns & Exchanges"
            description="Returns and exchange information is coming soon."
          />
        ),
      },
      {
        path: 'help/faq',
        element: (
          <PlaceholderPage
            title="FAQ"
            description="Frequently asked questions are coming soon."
          />
        ),
      },
      {
        path: 'legal/terms',
        element: (
          <PlaceholderPage
            title="Terms of Service"
            description="Our terms of service are coming soon."
          />
        ),
      },
      {
        path: 'legal/privacy',
        element: (
          <PlaceholderPage
            title="Privacy Policy"
            description="Our privacy policy is coming soon."
          />
        ),
      },
      {
        path: 'legal/cookies',
        element: (
          <PlaceholderPage
            title="Cookie Policy"
            description="Our cookie policy is coming soon."
          />
        ),
      },
      {
        path: 'legal/refunds',
        element: (
          <PlaceholderPage
            title="Refund Policy"
            description="Our refund policy is coming soon."
          />
        ),
      },
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
