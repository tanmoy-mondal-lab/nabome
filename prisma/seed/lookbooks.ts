import { type PrismaClient } from '@prisma/client';

export async function seedLookbooks(prisma: PrismaClient) {
  const lookbooks = [
    {
      name: 'Summer 2024',
      slug: 'summer-2024',
      description: 'Embrace the warmth with our summer collection featuring lightweight fabrics and breezy silhouettes.',
      coverImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
      season: 'Summer',
      year: 2024,
      layout: 'grid',
      story: {
        introduction: 'Our Summer 2024 collection celebrates the art of warm-weather dressing with effortless elegance.',
        theme: 'Lightness, breathability, and timeless style',
        inspiration: 'Mediterranean summers and coastal living',
      },
      tags: ['summer', 'lightweight', 'breezy', 'casual'],
      metaTitle: 'Summer 2024 Lookbook | নবME',
      metaDesc: 'Explore our Summer 2024 lookbook featuring lightweight fabrics and breezy silhouettes.',
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
    {
      name: 'Workwear Edit',
      slug: 'workwear-edit',
      description: 'Sophisticated pieces that transition seamlessly from office to evening meetings.',
      coverImageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80',
      season: 'All Season',
      year: 2024,
      layout: 'editorial',
      story: {
        introduction: 'The modern professional deserves wardrobe that works as hard as they do.',
        theme: 'Sophistication meets versatility',
        inspiration: 'Urban professionals and creative industries',
      },
      tags: ['workwear', 'professional', 'sophisticated', 'versatile'],
      metaTitle: 'Workwear Edit Lookbook | নবME',
      metaDesc: 'Discover sophisticated workwear pieces that transition from office to evening.',
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
    {
      name: 'Evening Elegance',
      slug: 'evening-elegance',
      description: 'Statement pieces for special occasions and memorable evenings.',
      coverImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
      season: 'All Season',
      year: 2024,
      layout: 'grid',
      story: {
        introduction: 'Every special occasion deserves a look that makes a lasting impression.',
        theme: 'Luxury, sophistication, and timeless beauty',
        inspiration: 'Red carpet events and gala dinners',
      },
      tags: ['evening', 'formal', 'luxury', 'special-occasion'],
      metaTitle: 'Evening Elegance Lookbook | নবME',
      metaDesc: 'Explore statement pieces for special occasions and memorable evenings.',
      isActive: true,
      sortOrder: 3,
      publishedAt: new Date(),
    },
  ];

  for (const lookbook of lookbooks) {
    const created = await prisma.lookbook.upsert({
      where: { slug: lookbook.slug },
      update: lookbook,
      create: lookbook,
    });

    // Add lookbook items
    await seedLookbookItems(prisma, created.id);
  }
}

async function seedLookbookItems(prisma: PrismaClient, lookbookId: string) {
  const items = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b287c3f9f4e6?w=800&q=80',
      caption: 'Silk Midi Dress - Summer Collection',
      sortOrder: 1,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
      caption: 'Linen Blouse - Casual Elegance',
      sortOrder: 2,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
      caption: 'Tailored Blazer - Professional Polish',
      sortOrder: 3,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
      caption: 'Evening Ensemble - Special Occasion',
      sortOrder: 4,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      caption: 'Complete Look - Head to Toe',
      sortOrder: 5,
    },
  ];

  for (const item of items) {
    await prisma.lookbookItem.create({
      data: {
        lookbookId,
        ...item,
      },
    });
  }
}
