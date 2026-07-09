import { PrismaClient } from '@prisma/client';
import { seedCategories } from './categories';
import { seedProducts } from './products';
import { seedCollections } from './collections';
import { seedBrands } from './brands';
import { seedLabels } from './labels';
import { seedCoupons } from './coupons';
import { seedCMS } from './cms';
import { seedLookbooks } from './lookbooks';
import { seedAnnouncements } from './announcements';
import { seedSettings } from './settings';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NABOME V1 Launch Content Seeding...\n');

  // Clear existing data (in development mode)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('🧹 Clearing existing seed data...');
    await prisma.homepageSection.deleteMany();
    await prisma.navigationMenu.deleteMany();
    await prisma.footerSection.deleteMany();
    await prisma.staticPage.deleteMany();
    await prisma.announcementBar.deleteMany();
    await prisma.lookbookItem.deleteMany();
    await prisma.lookbook.deleteMany();
    await prisma.productLabelOnProduct.deleteMany();
    await prisma.productLabel.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    console.log('✅ Cleared existing data\n');
  }

  // Seed in order of dependencies
  console.log('📦 Seeding Categories...');
  await seedCategories(prisma);
  console.log('✅ Categories seeded\n');

  console.log('🏷️  Seeding Brands...');
  await seedBrands(prisma);
  console.log('✅ Brands seeded\n');

  console.log('👗 Seeding Products...');
  await seedProducts(prisma);
  console.log('✅ Products seeded\n');

  console.log('🎨 Seeding Collections...');
  await seedCollections(prisma);
  console.log('✅ Collections seeded\n');

  console.log('🏷️  Seeding Labels...');
  await seedLabels(prisma);
  console.log('✅ Labels seeded\n');

  console.log('🎟️  Seeding Coupons...');
  await seedCoupons(prisma);
  console.log('✅ Coupons seeded\n');

  console.log('📄 Seeding CMS Content...');
  await seedCMS(prisma);
  console.log('✅ CMS Content seeded\n');

  console.log('📸 Seeding Lookbooks...');
  await seedLookbooks(prisma);
  console.log('✅ Lookbooks seeded\n');

  console.log('📢 Seeding Announcements...');
  await seedAnnouncements(prisma);
  console.log('✅ Announcements seeded\n');

  console.log('⚙️  Seeding Settings...');
  await seedSettings(prisma);
  console.log('✅ Settings seeded\n');

  console.log('🎉 NABOME V1 Launch Content Seeding Complete!\n');
  console.log('📊 Summary:');
  console.log('   - Categories: 6');
  console.log('   - Subcategories: 12');
  console.log('   - Brands: 4');
  console.log('   - Products: 24');
  console.log('   - Collections: 4');
  console.log('   - Labels: 5');
  console.log('   - Coupons: 3');
  console.log('   - CMS Pages: 6');
  console.log('   - Homepage Sections: 8');
  console.log('   - Lookbooks: 3');
  console.log('   - Announcements: 2');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
