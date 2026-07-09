import { type PrismaClient } from '@prisma/client';

export async function seedCollections(prisma: PrismaClient) {
  const collections = [
    {
      name: 'Summer Essentials',
      slug: 'summer-essentials',
      description: 'Lightweight fabrics and breezy silhouettes perfect for the warm season. Our curated selection of summer wardrobe staples.',
      heroImageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metaTitle: 'Summer Essentials Collection | Premium Fashion',
      metaDesc: 'Discover lightweight fabrics and breezy silhouettes perfect for the warm season.',
    },
    {
      name: 'Workwear Edit',
      slug: 'workwear-edit',
      description: 'Sophisticated pieces that transition seamlessly from office to evening. Tailored silhouettes and premium materials for the modern professional.',
      heroImageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80',
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      metaTitle: 'Workwear Edit | Professional Fashion Collection',
      metaDesc: 'Sophisticated pieces that transition seamlessly from office to evening.',
    },
    {
      name: 'Weekend Casual',
      slug: 'weekend-casual',
      description: 'Relaxed styles for leisure and weekends. Comfortable yet refined pieces perfect for casual outings and relaxed gatherings.',
      heroImageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
      metaTitle: 'Weekend Casual Collection | Relaxed Premium Fashion',
      metaDesc: 'Relaxed styles for leisure and weekends. Comfortable yet refined pieces.',
    },
    {
      name: 'Evening Elegance',
      slug: 'evening-elegance',
      description: 'Statement pieces for special occasions and evening events. Luxurgical fabrics and sophisticated designs for memorable moments.',
      heroImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
      isActive: true,
      isFeatured: true,
      sortOrder: 4,
      metaTitle: 'Evening Elegance Collection | Special Occasion Fashion',
      metaDesc: 'Statement pieces for special occasions and evening events. Luxurious fabrics.',
    },
  ];

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: collection,
      create: collection,
    });
  }
}
