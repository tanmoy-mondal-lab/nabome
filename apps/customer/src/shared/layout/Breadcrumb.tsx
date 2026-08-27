import { ChevronRight, Home } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

/**
 * Breadcrumb component following NAVIGATION_ARCHITECTURE.md
 *
 * Features:
 * - Automatic breadcrumb generation from route
 * - Home link at the start
 * - Accessible navigation
 * - Responsive truncation
 * - SEO-friendly structured data readiness
 */
export function Breadcrumb(): ReactNode {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0) {
    return null;
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    ...pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      // Format the name (capitalize, replace hyphens with spaces)
      const formattedName = name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { name: formattedName, path };
    }),
  ];

  return (
    <nav
      className="flex items-center gap-2 text-sm text-(--text-secondary)"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-(--text-tertiary)" />
              )}
              {index === 0 ? (
                <Link
                  to={crumb.path}
                  className="flex items-center gap-1 hover:text-(--text-brand) focus:outline-none focus:ring-2 focus:ring-(--border-focus) rounded-md px-1 py-0.5"
                  aria-current={isLast ? 'page' : undefined}
                >
                  <Home className="h-4 w-4" />
                  <span className="sr-only desktop:not-sr-only">
                    {crumb.name}
                  </span>
                </Link>
              ) : isLast ? (
                <span
                  className="text-(--text-primary) font-medium"
                  aria-current="page"
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-(--text-brand) focus:outline-none focus:ring-2 focus:ring-(--border-focus) rounded-md px-1 py-0.5"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
