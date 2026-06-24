#!/bin/bash

# Simple approach - just edit the files with the skeleton pattern
# Collect imports first, then replace

echo "Updating imports and replacing loading spinners with skeletons..."

# DashboardPage - add import and replace spinner
sed -i '2i\
import { StatsSkeleton } from "../common/skeletons";' src/admin/dashboard/DashboardPage.tsx
sed -i '32,38c\
  if (loading) {\
    return <StatsSkeleton />;\
  }' src/admin/dashboard/DashboardPage.tsx

echo "✓ DashboardPage updated"

# CollectionsPage - add import and replace spinner
sed -i '2i\
import { CardGridSkeleton } from "../common/skeletons";' src/admin/collections/CollectionsPage.tsx
sed -i '94,100c\
  if (loading) {\
    return <CardGridSkeleton />;\
  }' src/admin/collections/CollectionsPage.tsx

echo "✓ CollectionsPage updated"

# CategoriesPage - add import and replace spinner
sed -i '2i\
import { CardGridSkeleton } from "../common/skeletons";' src/admin/categories/CategoriesPage.tsx
sed -i '108,114c\
  if (loading) {\
    return <CardGridSkeleton />;\
  }' src/admin/categories/CategoriesPage.tsx

echo "✓ CategoriesPage updated"

# CustomersPage - add import and replace spinner
sed -i '2i\
import { TableSkeleton } from "../common/skeletons";' src/admin/customers/CustomersPage.tsx
sed -i '120,126c\
          {loading ? <TableSkeleton /> : customers.map((customer) =>' src/admin/customers/CustomersPage.tsx
echo "✓ CustomersPage updated"

# CouponsPage - add import and replace spinner
sed -i '2i\
import { TableSkeleton } from "../common/skeletons";' src/admin/coupons/CouponsPage.tsx
sed -i '132,138c\
          {loading ? <TableSkeleton /> : coupons.map((coupon) =>' src/admin/coupons/CouponsPage.tsx
echo "✓ CouponsPage updated"

