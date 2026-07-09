import { type PrismaClient, AnnouncementBarPosition } from '@prisma/client';

export async function seedAnnouncements(prisma: PrismaClient) {
  const announcements = [
    {
      text: 'Free shipping on orders above ₹500 | Use code WELCOME10 for 10% off your first order',
      linkUrl: '/collections',
      bgColor: '#000000',
      textColor: '#FFFFFF',
      position: AnnouncementBarPosition.TOP,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      text: 'Summer Sale - Up to 40% off on selected items',
      linkUrl: '/products?sale=true',
      bgColor: '#DC2626',
      textColor: '#FFFFFF',
      position: AnnouncementBarPosition.TOP,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcementBar.upsert({
      where: { id: announcement.text }, // Using text as unique identifier
      update: announcement,
      create: announcement,
    });
  }
}
