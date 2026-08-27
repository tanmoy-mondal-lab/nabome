import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';

import { AdminRoute } from '@/shared/auth/AdminRoute';
import { AdminLayout } from '@/shared/layout/AdminLayout';
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

/** Route tree — every admin page sits behind AdminRoute inside AdminLayout. */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <AdminLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(
              () => import('@/features/admin/dashboard/pages/DashboardPage'),
            ),
          },
          { path: 'dashboard', element: <NavigateToDashboard /> },
          {
            path: 'products',
            lazy: lazyPage(
              () => import('@/features/admin/products/pages/ProductsPage'),
            ),
          },
          {
            path: 'orders',
            lazy: lazyPage(
              () => import('@/features/admin/orders/pages/OrdersPage'),
            ),
          },
          {
            path: 'customers',
            lazy: lazyPage(
              () => import('@/features/admin/customers/pages/CustomersPage'),
            ),
          },
          {
            path: 'analytics',
            lazy: lazyPage(
              () => import('@/features/admin/analytics/pages/AnalyticsPage'),
            ),
          },
          {
            path: 'settings',
            lazy: lazyPage(
              () => import('@/features/admin/settings/pages/SettingsPage'),
            ),
          },
          {
            path: 'shops',
            lazy: lazyPage(
              () => import('@/features/admin/shops/pages/ShopsPage'),
            ),
          },
          {
            path: 'shops/:id',
            lazy: lazyPage(
              () => import('@/features/admin/shops/pages/ShopDetailPage'),
            ),
          },
          {
            path: 'security',
            lazy: lazyPage(
              () => import('@/features/admin/security/pages/SecurityPage'),
            ),
          },
          {
            path: 'system',
            lazy: lazyPage(
              () => import('@/features/admin/system/pages/SystemPage'),
            ),
          },
          {
            path: 'reports',
            lazy: lazyPage(
              () => import('@/features/admin/reports/pages/ReportsPage'),
            ),
          },
          {
            path: 'payments',
            lazy: lazyPage(
              () => import('@/features/admin/payments/pages/PaymentsPage'),
            ),
          },
          {
            path: 'returns',
            lazy: lazyPage(
              () => import('@/features/admin/returns/pages/ReturnsPage'),
            ),
          },
          {
            path: 'cms',
            lazy: lazyPage(() => import('@/features/admin/cms/pages/CMSPage')),
          },
        ],
      },
      { path: 'forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
