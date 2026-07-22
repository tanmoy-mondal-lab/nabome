/**
 * Production Seed System - Main Entry Point
 * 
 * This script seeds the NABOME platform with production-ready starter data.
 * All seeds are idempotent - running multiple times will not create duplicates.
 * 
 * Dependency Order:
 * 1. System (settings, currencies, countries, shipping, tax, payment, analytics)
 * 2. Roles & Permissions
 * 3. Admin
 * 4. Customers
 * 5. Categories
 * 6. Brands
 * 7. Collections
 * 8. Products (with variants, images, inventory, attributes)
 * 9. CMS (homepage, navigation, footer, lookbooks, announcements, FAQ)
 * 10. Marketing (coupons, newsletter, notifications, email templates)
 */

import { prisma } from './utils/helpers';

// System seeds
import { seedSiteSettings } from './system/site-settings';
import { seedCurrencies } from './system/currencies';
import { seedCountries } from './system/countries';
import { seedShippingZones } from './system/shipping-zones';
import { seedTax } from './system/tax';
import { seedPaymentMethods } from './system/payment-methods';
import { seedAnalytics } from './system/analytics';

// Admin seeds
import { seedAdmin } from './admin/admin';
import { seedRoles } from './admin/roles';
import { seedPermissions } from './admin/permissions';

// Customer seeds
import { seedCustomer } from './customers/customer';
import { seedCustomerAddresses } from './customers/addresses';

// Product seeds
import { seedCategories } from './products/categories';
import { seedSubcategories } from './products/subcategories';
import { seedBrands } from './products/brands';
import { seedCollections } from './products/collections';
import { seedLabels } from './products/labels';
import { seedTags } from './products/tags';
import { seedSizeGuides } from './products/size-guides';
import { seedProducts } from './products/products';
import { seedVariants } from './products/variants';
import { seedProductImages } from './products/product-images';
import { seedInventory } from './products/inventory';
import { seedAttributes } from './products/attributes';
import { seedPricing } from './products/pricing';

// CMS seeds
import { seedHomepage } from './cms/homepage';
import { seedHero } from './cms/hero';
import { seedHeader } from './cms/header';
import { seedFooter } from './cms/footer';
import { seedLookbooks } from './cms/lookbooks';
import { seedAnnouncements } from './cms/announcements';
import { seedFAQ } from './cms/faq';
import { seedPageTemplates } from './cms/page-templates';
import { seedNavigation } from './cms/navigation';
import { seedSEO } from './cms/seo';

// Marketing seeds
import { seedCoupon } from './marketing/coupon';
import { seedNewsletter } from './marketing/newsletter';
import { seedNotificationTemplates } from './marketing/notification-template';
import { seedEmailTemplates } from './marketing/email-template';

async function main() {
  // eslint-disable-next-line no-console
  console.log('🌱 Starting NABOME Production Seed System...\n');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 1: SYSTEM CONFIGURATION');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  await seedSiteSettings();
  await seedCurrencies();
  await seedCountries();
  await seedShippingZones();
  await seedTax();
  await seedPaymentMethods();
  await seedAnalytics();

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 2: ROLES & PERMISSIONS');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  await seedRoles();
  await seedPermissions();

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 3: ADMIN');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  await seedAdmin();

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 4: CUSTOMERS');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  const { customer } = await seedCustomer();
  await seedCustomerAddresses(customer.id);

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 5: PRODUCT FOUNDATION');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  const category = await seedCategories();
  const subcategory = await seedSubcategories(category.id);
  const brand = await seedBrands();
  const collection = await seedCollections();
  const label = await seedLabels();
  const tag = await seedTags();
  const sizeGuide = await seedSizeGuides(category.id);

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 6: PRODUCTS');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  const product = await seedProducts(
    category.id,
    subcategory.id,
    collection.id,
    brand.id,
    sizeGuide.id
  );
  const variants = await seedVariants(product.id);
  await seedProductImages(product.id);
  await seedInventory(variants.map(v => v.id));
  await seedAttributes(product.id);
  await seedPricing(product.id, label.id, tag.id);

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 7: CMS');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  await seedHomepage();
  await seedHero();
  await seedHeader();
  await seedFooter();
  await seedLookbooks();
  await seedAnnouncements();
  await seedFAQ();
  await seedPageTemplates();
  await seedNavigation();
  await seedSEO();

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('PHASE 8: MARKETING');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  await seedCoupon();
  await seedNewsletter();
  await seedNotificationTemplates();
  await seedEmailTemplates();

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('✅ PRODUCTION SEED COMPLETE');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('\n📊 SEED SUMMARY:');
  // eslint-disable-next-line no-console
  console.log('   System Settings: 1');
  // eslint-disable-next-line no-console
  console.log('   Currencies: 4 (INR, USD, EUR, GBP)');
  // eslint-disable-next-line no-console
  console.log('   Admin Account: 1');
  // eslint-disable-next-line no-console
  console.log('   Customer Account: 1');
  // eslint-disable-next-line no-console
  console.log('   Categories: 1');
  // eslint-disable-next-line no-console
  console.log('   Subcategories: 1');
  // eslint-disable-next-line no-console
  console.log('   Brands: 1');
  // eslint-disable-next-line no-console
  console.log('   Collections: 1');
  // eslint-disable-next-line no-console
  console.log('   Products: 1');
  // eslint-disable-next-line no-console
  console.log('   Product Variants: 5');
  // eslint-disable-next-line no-console
  console.log('   Product Images: 3');
  // eslint-disable-next-line no-console
  console.log('   Product Attributes: 4');
  // eslint-disable-next-line no-console
  console.log('   Size Guides: 1');
  // eslint-disable-next-line no-console
  console.log('   Homepage Sections: 2');
  // eslint-disable-next-line no-console
  console.log('   Footer Sections: 4');
  // eslint-disable-next-line no-console
  console.log('   Lookbooks: 1');
  // eslint-disable-next-line no-console
  console.log('   Announcements: 1');
  // eslint-disable-next-line no-console
  console.log('   FAQs: 3');
  // eslint-disable-next-line no-console
  console.log('   Page Templates: 1');
  // eslint-disable-next-line no-console
  console.log('   Navigation Menus: 2');
  // eslint-disable-next-line no-console
  console.log('   Coupons: 1');
  // eslint-disable-next-line no-console
  console.log('   Notification Templates: 3');
  // eslint-disable-next-line no-console
  console.log('\n⚠️  IMPORTANT:');
  // eslint-disable-next-line no-console
  console.log('   - Admin password: Admin@123 (CHANGE ON FIRST LOGIN)');
  // eslint-disable-next-line no-console
  console.log('   - Customer email: customer@example.com');
  // eslint-disable-next-line no-console
  console.log('   - Coupon code: WELCOME10 (10% off, min ₹999)');
  // eslint-disable-next-line no-console
  console.log('\n🎉 Platform is now ready for use!');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
