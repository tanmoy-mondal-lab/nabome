import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.profiles.update({
    where: { email: 'testadmin@nabome.online' },
    data: { role: 'admin', emailVerified: true }
  });
  // eslint-disable-next-line no-console
  console.log('Updated test user to admin');
}

main()
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => prisma.$disconnect());
