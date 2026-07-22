#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// LIST ALL PROFILES
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listProfiles() {
  const profiles = await prisma.profile.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // eslint-disable-next-line no-console
  console.log(`\n📋 Total profiles: ${profiles.length}\n`);
  
  profiles.forEach((profile, index) => {
    // eslint-disable-next-line no-console
    console.log(`${index + 1}. ${profile.email}`);
    // eslint-disable-next-line no-console
    console.log(`   Name: ${profile.firstName} ${profile.lastName || ''}`);
    // eslint-disable-next-line no-console
    console.log(`   Role: ${profile.role}`);
    // eslint-disable-next-line no-console
    console.log(`   Active: ${profile.isActive}`);
    // eslint-disable-next-line no-console
    console.log(`   Created: ${profile.createdAt.toISOString()}`);
    // eslint-disable-next-line no-console
    console.log(`   ID: ${profile.id}`);
    // eslint-disable-next-line no-console
    console.log('');
  });
}

listProfiles()
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => prisma.$disconnect());
