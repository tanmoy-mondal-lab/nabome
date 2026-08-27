import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';

import { ShopRoute } from '@/shared/auth/ShopRoute';
import { ShopLayout } from '@/shared/layout/ShopLayout';
import { ForbiddenPage } from '@/shared/pages/ForbiddenPage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { ServerErrorPage } from '@/shared/pages/ServerErrorPage';

type PageModule = { default: ComponentType<unknown> };

/** Code-splits a page module into a React Router lazy definition. */
function lazyPage(
  loader: () => Promise<PageModule>,
): () => Promise<{ Component: ComponentType<unknown> }> {
  return async () => ({ Component: (await loader()).default });
}

function NavigateToDashboard() {
  return <Navigate to="/" replace />;
}

/** Route tree — every shop page sits behind ShopRoute inside ShopLayout. */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <ShopLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <ShopRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(
              () => import('@/features/shop/dashboard/pages/DashboardPage'),
            ),
          },
          { path: 'dashboard', element: <NavigateToDashboard /> },
          {
            path: 'products',
            lazy: lazyPage(
              () => import('@/features/shop/products/pages/ProductsPage'),
            ),
          },
          {
            path: 'orders',
            lazy: lazyPage(
              () => import('@/features/shop/orders/pages/OrdersPage'),
            ),
          },
          {
            path: 'customers',
            lazy: lazyPage(
              () => import('@/features/shop/customers/pages/CustomersPage'),
            ),
          },
          {
            path: 'analytics',
            lazy: lazyPage(
              () => import('@/features/shop/analytics/pages/AnalyticsPage'),
            ),
          },
          {
            path: 'settings',
            lazy: lazyPage(
              () => import('@/features/shop/settings/pages/SettingsPage'),
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
