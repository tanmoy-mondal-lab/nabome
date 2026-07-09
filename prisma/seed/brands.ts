import { type PrismaClient } from '@prisma/client';

export async function seedBrands(prisma: PrismaClient) {
  const brands = [
    {
      name: 'NABOME Essentials',
      slug: 'nabome-essentials',
      description: 'Our in-house collection of timeless wardrobe staples crafted with premium materials.',
      logoUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200&q=80',
      websiteUrl: 'https://www.nabome.online',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Artisan Collective',
      slug: 'artisan-collective',
      description: 'Handcrafted pieces from skilled artisans, celebrating traditional techniques.',
      logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80',
      websiteUrl: null,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Urban Studio',
      slug: 'urban-studio',
      description: 'Contemporary streetwear meets refined aesthetics for the modern urbanite.',
      logoUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&q=80',
      websiteUrl: null,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Heritage Line',
      slug: 'heritage-line',
      description: 'Classic designs inspired by vintage aesthetics, reimagined for today.',
      logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&q=80',
      websiteUrl: null,
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    });
  }
}
