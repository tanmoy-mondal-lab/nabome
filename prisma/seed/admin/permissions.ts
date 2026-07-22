/**
 * Permissions Seed
 * Seeds permission definitions
 * Note: Permissions are enforced at the API level
 * This seed documents the permission system
 */

export async function seedPermissions() {
  // eslint-disable-next-line no-console
  console.log('🔐 Seeding permissions...');

  // Permissions are enforced via API middleware
  // This documents the permission structure
  const permissions = {
    product: [
      'products.read',
      'products.create',
      'products.update',
      'products.delete',
    ],
    order: [
      'orders.read',
      'orders.read_own',
      'orders.update',
      'orders.cancel',
      'orders.refund',
    ],
    customer: [
      'customers.read',
      'customers.read_own',
      'customers.update',
      'customers.delete',
    ],
    cms: [
      'cms.read',
      'cms.create',
      'cms.update',
      'cms.delete',
      'cms.publish',
    ],
    settings: [
      'settings.read',
      'settings.update',
    ],
    analytics: [
      'analytics.read',
    ],
    media: [
      'media.read',
      'media.create',
      'media.update',
      'media.delete',
    ],
  };

  // eslint-disable-next-line no-console
  console.log('Permission groups:', Object.keys(permissions).join(', '));

  return permissions;
}
