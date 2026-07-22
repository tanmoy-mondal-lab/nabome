/**
 * Roles Seed
 * Seeds user roles
 * Note: Roles are stored as enum in profiles table
 * This seed documents the available roles
 */

export async function seedRoles() {
  // eslint-disable-next-line no-console
  console.log('🔑 Seeding roles...');

  // Roles are stored as enum in the profiles table
  // This documents the available roles
  const roles = [
    {
      name: 'customer',
      description: 'Regular customer with shopping capabilities',
      permissions: [
        'browse_products',
        'view_products',
        'add_to_cart',
        'checkout',
        'view_own_orders',
        'manage_own_addresses',
        'submit_reviews',
        'manage_wishlist',
        'support_tickets',
      ],
    },
    {
      name: 'admin',
      description: 'Administrator with full platform access',
      permissions: [
        'all_customer_permissions',
        'manage_products',
        'manage_categories',
        'manage_collections',
        'manage_brands',
        'manage_orders',
        'manage_customers',
        'manage_coupons',
        'manage_cms',
        'manage_settings',
        'view_analytics',
        'manage_media',
        'moderate_reviews',
        'process_returns',
        'manage_feature_flags',
        'view_audit_logs',
      ],
    },
  ];

  // eslint-disable-next-line no-console
  console.log('Available roles:', roles.map(r => r.name).join(', '));

  return roles;
}
