import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.profiles.update({
    where: { email: 'testadmin@nabome.online' },
    data: { role: 'admin', emailVerified: true }
  });
  console.log('Updated test user to admin');
}

main().catch(console.error).finally(() => prisma.$disconnect());
