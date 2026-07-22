/**
 * Product Images Seed
 * Seeds product images
 */

import { prisma } from '../utils/helpers';

export async function seedProductImages(productId: string) {
  // eslint-disable-next-line no-console
  console.log('🖼️  Seeding product images...');

  // Note: In production, images would be uploaded to Cloudinary
  // For seed purposes, we use placeholder URLs
  const images = [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nabome/products/royal-kurta-front.jpg',
      alt_text: 'Royal Embroidered Kurta - Front View',
      sort_order: 1,
      is_primary: true,
      type: 'image',
      variant_id: null,
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nabome/products/royal-kurta-back.jpg',
      alt_text: 'Royal Embroidered Kurta - Back View',
      sort_order: 2,
      is_primary: false,
      type: 'image',
      variant_id: null,
    },
    {
      url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/nabome/products/royal-kurta-detail.jpg',
      alt_text: 'Royal Embroidered Kurta - Embroidery Detail',
      sort_order: 3,
      is_primary: false,
      type: 'image',
      variant_id: null,
    },
  ];

  const createdImages = [];

  for (const img of images) {
    const created = await prisma.product_images.upsert({
      where: {
        id: crypto.randomUUID(), // Will create new each time
      },
      create: {
        id: crypto.randomUUID(),
        ...img,
        product_id: productId,
        public_id: `nabome/products/royal-kurta-${img.sort_order}`,
      },
      update: {},
    });
    createdImages.push(created);
  }

  return createdImages;
}
