#!/bin/bash
set -e

# Apply skeletons to admin pages - Item 2

echo "Applying skeleton loading to admin pages..."

# DashboardPage - StatsSkeleton
read -r dashboard_content <<< "$(sed -n '1,273p' src/admin/dashboard/DashboardPage.tsx)"
if echo "$dashboard_content" | grep -q "if (loading) {"; then
  # Create updated DashboardPage with skeleton
  sed -i '32,38c\
  if (loading) {\
    return <StatsSkeleton />;\
  }' src/admin/dashboard/DashboardPage.tsx
  echo "✓ Applied StatsSkeleton to DashboardPage"
fi

# CollectionsPage - CardGridSkeleton
sed -i '94,100c\
  if (loading) {\
    return <CardGridSkeleton />;\
  }' src/admin/collections/CollectionsPage.tsx
echo "✓ Applied CardGridSkeleton to CollectionsPage"

# CategoriesPage - CardGridSkeleton
sed -i '108,114c\
  if (loading) {\
    return <CardGridSkeleton />;\
  }' src/admin/categories/CategoriesPage.tsx
echo "✓ Applied CardGridSkeleton to CategoriesPage"

# CustomersPage - TableSkeleton
sed -i '127,133c\
          {loading ? <TableSkeleton /> : customers.map((customer) =>' src/admin/customers/CustomersPage.tsx
echo "✓ Applied TableSkeleton to CustomersPage"

# CouponsPage - TableSkeleton
sed -i '132,138c\
          {loading ? <TableSkeleton /> : coupons.map((coupon) =>' src/admin/coupons/CouponsPage.tsx
echo "✓ Applied TableSkeleton to CouponsPage"

# AnnouncementsPage - TableSkeleton
sed -i '114,120c\
          {loading ? <TableSkeleton /> : announcements.map((announcement) =>' src/admin/announcements/AnnouncementsPage.tsx
echo "✓ Applied TableSkeleton to AnnouncementsPage"

# ContactsPage - TableSkeleton
sed -i '68,74c\
        {loading ? <TableSkeleton /> : contacts.map((contact) =>' src/admin/contacts/ContactsPage.tsx
echo "✓ Applied TableSkeleton to ContactsPage"

# FAQPage - TableSkeleton
sed -i '121,126c\
    return <TableSkeleton />;' src/admin/faq/FAQPage.tsx
echo "✓ Applied TableSkeleton to FAQPage"

# NewsletterPage - TableSkeleton
sed -i '52,58c\
      return <TableSkeleton />;' src/admin/newsletter/NewsletterPage.tsx
echo "✓ Applied TableSkeleton to NewsletterPage"

# SupportTicketsPage - TableSkeleton
sed -i '105,111c\
          {loading ? <TableSkeleton /> : tickets.map((ticket) =>' src/admin/support/SupportTicketsPage.tsx
echo "✓ Applied TableSkeleton to SupportTicketsPage"

# CMSPagesPage - TableSkeleton
sed -i '110,116c\
          {loading ? <TableSkeleton /> : pages.map((page) =>' src/admin/cms/CMSPagesPage.tsx
echo "✓ Applied TableSkeleton to CMSPagesPage"

# OrdersPage - StatsSkeleton + TableSkeleton
# This is more complex, need to handle both stats and table
sed -i '183,189c\
          {loading ? <StatsSkeleton /> : stats && (\
          <TableSkeleton />\
        )}' src/admin/orders/OrdersPage.tsx
echo "✓ Applied StatsSkeleton + TableSkeleton to OrdersPage"

# SettingsPage - FormSkeleton
sed -i '105,111c\
          {loading ? <FormSkeleton /> : (' src/admin/settings/SettingsPage.tsx
echo "✓ Applied FormSkeleton to SettingsPage"

