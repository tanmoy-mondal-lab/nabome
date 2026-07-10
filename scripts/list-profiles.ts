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

  console.log(`\n📋 Total profiles: ${profiles.length}\n`);
  
  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.email}`);
    console.log(`   Name: ${profile.firstName} ${profile.lastName || ''}`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   Active: ${profile.isActive}`);
    console.log(`   Created: ${profile.createdAt.toISOString()}`);
    console.log(`   ID: ${profile.id}`);
    console.log('');
  });
}

listProfiles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
