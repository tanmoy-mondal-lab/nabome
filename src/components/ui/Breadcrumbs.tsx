// ─────────────────────────────────────────────────────────────
// BREADCRUMBS COMPONENT
// ─────────────────────────────────────────────────────────────
// Navigation breadcrumbs for hierarchical content
// ─────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { cn } from "../../lib/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("py-4", className)}>
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.href && !item.current ? (
              <Link
                to={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium",
                  item.current ? "text-gray-900" : "text-gray-600"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface BreadcrumbProps {
  label: string;
  href?: string;
  current?: boolean;
}

export function Breadcrumb({ label, href, current }: BreadcrumbProps) {
  return (
    <li className="flex items-center">
      {href && !current ? (
        <Link to={href} className="text-gray-600 hover:text-gray-900 transition-colors">
          {label}
        </Link>
      ) : (
        <span
          className={cn("font-medium", current ? "text-gray-900" : "text-gray-600")}
          aria-current={current ? "page" : undefined}
        >
          {label}
        </span>
      )}
    </li>
  );
}
