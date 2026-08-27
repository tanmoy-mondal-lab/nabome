import type { ReactNode } from 'react';

import { Breadcrumb } from './Breadcrumb';

/**
 * Standard Page Layout following RESPONSIVE_LAYOUT_ARCHITECTURE.md
 *
 * Features:
 * - Responsive container system
 * - Breadcrumb navigation
 * - Page header with title
 * - Content area with proper spacing
 * - Mobile-first design
 * - Accessible structure
 */
export function PageLayout({
  title,
  subtitle,
  children,
  showBreadcrumb = true,
  containerWidth = 'default',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  showBreadcrumb?: boolean;
  containerWidth?: 'narrow' | 'default' | 'wide' | 'full';
}): ReactNode {
  const containerClasses = {
    narrow: 'max-w-(--container-narrow)',
    default: 'max-w-(--container-default)',
    wide: 'max-w-(--container-wide)',
    full: 'max-w-full',
  };

  return (
    <div className="flex-1">
      <div
        className={`mx-auto w-full px-4 py-6 tablet:py-8 ${containerClasses[containerWidth]}`}
      >
        {showBreadcrumb && <Breadcrumb />}

        {(title || subtitle) && (
          <div className="mt-4 mb-6 tablet:mt-6 tablet:mb-8">
            {title && (
              <h1 className="text-2xl font-semibold text-(--text-primary) tablet:text-3xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-(--text-secondary) tablet:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * CMS Page Layout for dynamic content pages
 */
export function CmsPageLayout({
  children,
  containerWidth = 'default',
}: {
  children: ReactNode;
  containerWidth?: 'narrow' | 'default' | 'wide' | 'full';
}): ReactNode {
  return (
    <PageLayout showBreadcrumb={true} containerWidth={containerWidth}>
      {children}
    </PageLayout>
  );
}

/**
 * Product Page Layout for product detail pages
 */
export function ProductPageLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-(--container-wide) px-4 py-6 tablet:py-8">
        <Breadcrumb />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/**
 * Listing Page Layout for category/shop pages
 */
export function ListingPageLayout({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-(--container-wide) px-4 py-6 tablet:py-8">
        <Breadcrumb />
        <div className="mt-4 mb-6 tablet:mt-6 tablet:mb-8">
          {title && (
            <h1 className="text-2xl font-semibold text-(--text-primary) tablet:text-3xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-2 text-sm text-(--text-secondary) tablet:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Checkout Page Layout for checkout flow
 */
export function CheckoutPageLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-(--container-narrow) px-4 py-6 tablet:py-8">
        <Breadcrumb />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/**
 * Dashboard Page Layout for account/dashboard pages
 */
export function DashboardPageLayout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-(--container-default) px-4 py-6 tablet:py-8">
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl font-semibold text-(--text-primary) tablet:text-3xl">
              {title}
            </h1>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
