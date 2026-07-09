import { type PrismaClient } from '@prisma/client';

export async function seedLabels(prisma: PrismaClient) {
  const labels = [
    {
      name: 'New Arrival',
      slug: 'new-arrival',
      color: '#10B981', // Emerald green
    },
    {
      name: 'Best Seller',
      slug: 'best-seller',
      color: '#F59E0B', // Amber
    },
    {
      name: 'Limited Edition',
      slug: 'limited-edition',
      color: '#EF4444', // Red
    },
    {
      name: 'Sale',
      slug: 'sale',
      color: '#DC2626', // Dark red
    },
    {
      name: 'Exclusive',
      slug: 'exclusive',
      color: '#8B5CF6', // Purple
    },
  ];

  for (const label of labels) {
    await prisma.productLabel.upsert({
      where: { slug: label.slug },
      update: label,
      create: label,
    });
  }
}
