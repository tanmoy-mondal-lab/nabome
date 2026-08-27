/**
 * Category Breadcrumbs Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays breadcrumb navigation for category hierarchy. Used on category
 * and product pages to show the navigation path.
 */

import type { Category } from '@nabome/types';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from './index';

interface CategoryBreadcrumbsProps {
  categories: Category[];
  currentCategory?: Category;
  onCategoryClick?: (category: Category) => void;
  linkComponent?: React.ComponentType<{
    to: string;
    children: React.ReactNode;
  }>;
  className?: string;
}

export function CategoryBreadcrumbs({
  categories,
  currentCategory,
  onCategoryClick,
  linkComponent,
  className = '',
}: CategoryBreadcrumbsProps) {
  return (
    <Breadcrumb className={`category-breadcrumbs ${className}`}>
      {/* Home */}
      <BreadcrumbItem>
        <BreadcrumbLink {...(linkComponent ? {} : { href: '/' })}>
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />

      {/* Category hierarchy */}
      {categories.map((category, index) => (
        <BreadcrumbItem key={category.id}>
          <BreadcrumbLink
            {...(linkComponent ? {} : { href: `/categories/${category.slug}` })}
            onClick={() => onCategoryClick?.(category)}
          >
            {category.name}
          </BreadcrumbLink>
          {index < categories.length - 1 && <BreadcrumbSeparator />}
        </BreadcrumbItem>
      ))}

      {/* Current category */}
      {currentCategory && (
        <>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              {...(linkComponent
                ? {}
                : { href: `/categories/${currentCategory.slug}` })}
              current
              onClick={() => onCategoryClick?.(currentCategory)}
            >
              {currentCategory.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
    </Breadcrumb>
  );
}
