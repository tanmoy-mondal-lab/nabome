import { type PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: 'Women',
      slug: 'women',
      description: 'Curated fashion for the modern woman - from everyday essentials to statement pieces.',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      sortOrder: 1,
      isActive: true,
      metaTitle: 'Women\'s Fashion | Premium Clothing & Accessories',
      metaDesc: 'Discover premium women\'s fashion at নবME. Shop curated collections of dresses, tops, bottoms, and accessories designed for the modern woman.',
    },
    {
      name: 'Men',
      slug: 'men',
      description: 'Sophisticated menswear blending timeless classics with contemporary design.',
      imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
      sortOrder: 2,
      isActive: true,
      metaTitle: 'Men\'s Fashion | Premium Clothing & Accessories',
      metaDesc: 'Shop premium men\'s fashion at নবME. From tailored suits to casual essentials, discover sophisticated menswear for every occasion.',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Elevate your look with our carefully selected accessories and finishing touches.',
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
      sortOrder: 3,
      isActive: true,
      metaTitle: 'Fashion Accessories | Premium Bags, Jewelry & More',
      metaDesc: 'Complete your look with premium accessories from নবME. Shop handbags, jewelry, scarves, and more to elevate your style.',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Step into comfort and style with our curated footwear collection.',
      imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
      sortOrder: 4,
      isActive: true,
      metaTitle: 'Premium Footwear | Shoes, Sneakers & Boots',
      metaDesc: 'Discover premium footwear at নবME. From elegant heels to comfortable sneakers, find the perfect pair for every occasion.',
    },
    {
      name: 'Jewelry',
      slug: 'jewelry',
      description: 'Timeless pieces crafted with precision and designed to last.',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      sortOrder: 5,
      isActive: true,
      metaTitle: 'Fine Jewelry | Premium Necklaces, Earrings & Rings',
      metaDesc: 'Shop premium jewelry at নবME. Discover timeless necklaces, earrings, and rings crafted with precision for lasting elegance.',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Curated home essentials that blend functionality with aesthetic appeal.',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      sortOrder: 6,
      isActive: true,
      metaTitle: 'Home & Living | Premium Home Decor & Essentials',
      metaDesc: 'Transform your space with premium home decor from নবME. Shop curated home essentials that blend functionality with aesthetic appeal.',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // Seed subcategories for Women
  const womenCategory = await prisma.category.findUnique({ where: { slug: 'women' } });
  if (womenCategory) {
    const womenSubcategories = [
      { name: 'Dresses', slug: 'dresses', categoryId: womenCategory.id, sortOrder: 1 },
      { name: 'Tops & Blouses', slug: 'tops-blouses', categoryId: womenCategory.id, sortOrder: 2 },
      { name: 'Bottoms', slug: 'bottoms', categoryId: womenCategory.id, sortOrder: 3 },
      { name: 'Outerwear', slug: 'outerwear', categoryId: womenCategory.id, sortOrder: 4 },
    ];

    for (const sub of womenSubcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: sub,
        create: sub,
      });
    }
  }

  // Seed subcategories for Men
  const menCategory = await prisma.category.findUnique({ where: { slug: 'men' } });
  if (menCategory) {
    const menSubcategories = [
      { name: 'Shirts', slug: 'shirts', categoryId: menCategory.id, sortOrder: 1 },
      { name: 'T-Shirts', slug: 't-shirts', categoryId: menCategory.id, sortOrder: 2 },
      { name: 'Trousers', slug: 'trousers', categoryId: menCategory.id, sortOrder: 3 },
      { name: 'Jackets', slug: 'jackets', categoryId: menCategory.id, sortOrder: 4 },
    ];

    for (const sub of menSubcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: sub,
        create: sub,
      });
    }
  }

  // Seed subcategories for Accessories
  const accessoriesCategory = await prisma.category.findUnique({ where: { slug: 'accessories' } });
  if (accessoriesCategory) {
    const accessoriesSubcategories = [
      { name: 'Bags', slug: 'bags', categoryId: accessoriesCategory.id, sortOrder: 1 },
      { name: 'Scarves', slug: 'scarves', categoryId: accessoriesCategory.id, sortOrder: 2 },
      { name: 'Belts', slug: 'belts', categoryId: accessoriesCategory.id, sortOrder: 3 },
    ];

    for (const sub of accessoriesSubcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: sub,
        create: sub,
      });
    }
  }

  // Seed subcategories for Footwear
  const footwearCategory = await prisma.category.findUnique({ where: { slug: 'footwear' } });
  if (footwearCategory) {
    const footwearSubcategories = [
      { name: 'Sneakers', slug: 'sneakers', categoryId: footwearCategory.id, sortOrder: 1 },
      { name: 'Boots', slug: 'boots', categoryId: footwearCategory.id, sortOrder: 2 },
      { name: 'Sandals', slug: 'sandals', categoryId: footwearCategory.id, sortOrder: 3 },
    ];

    for (const sub of footwearSubcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: sub,
        create: sub,
      });
    }
  }
}
