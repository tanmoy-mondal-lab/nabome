#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// ACCOUNT CLEANUP SCRIPT
// Removes all account-related data for a given email address
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupAccount(email: string, dryRun: boolean = true) {
  // eslint-disable-next-line no-console
  console.log(`\n${dryRun ? "DRY RUN" : "LIVE"} - Cleaning up account for: ${email}\n`);

  // Find the profile
  const profile = await prisma.profile.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      _count: {
        select: {
          addresses: true,
          sessions: true,
          couponRedemptions: true,
          purchasedGiftCards: true,
          redeemedGiftCards: true,
          loginAttempts: true,
          notifications: true,
          orders: true,
          refunds: true,
          returnRequests: true,
          reviews: true,
          subscriptions: true,
          supportTickets: true,
          wishlistItems: true,
          orderHistoryEntries: true,
          referredReferrals: true,
          supportReplies: true,
          assignedTickets: true,
          userActionLogs: true,
          verificationAttempts: true,
        },
      },
      cart: true,
      loyaltyPoints: true,
      referralCode: true,
    },
  });

  if (!profile) {
    // eslint-disable-next-line no-console
    console.log(`❌ No profile found with email: ${email}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`📊 Found profile: ${profile.id}`);
  // eslint-disable-next-line no-console
  console.log(`   Name: ${profile.firstName} ${profile.lastName || ""}`);
  // eslint-disable-next-line no-console
  console.log(`   Role: ${profile.role}`);
  // eslint-disable-next-line no-console
  console.log(`   Created: ${profile.createdAt.toISOString()}`);
  // eslint-disable-next-line no-console
  console.log(`\n📦 Related data to be deleted:`);
  // eslint-disable-next-line no-console
  console.log(`   - Addresses: ${profile._count.addresses}`);
  // eslint-disable-next-line no-console
  console.log(`   - Sessions: ${profile._count.sessions}`);
  // eslint-disable-next-line no-console
  console.log(`   - Cart: ${profile.cart ? 1 : 0}`);
  // eslint-disable-next-line no-console
  console.log(`   - Loyalty Points: ${profile.loyaltyPoints ? 1 : 0}`);
  // eslint-disable-next-line no-console
  console.log(`   - Referral Code: ${profile.referralCode ? 1 : 0}`);
  // eslint-disable-next-line no-console
  console.log(`   - Coupon Redemptions: ${profile._count.couponRedemptions}`);
  // eslint-disable-next-line no-console
  console.log(`   - Purchased Gift Cards: ${profile._count.purchasedGiftCards}`);
  // eslint-disable-next-line no-console
  console.log(`   - Redeemed Gift Cards: ${profile._count.redeemedGiftCards}`);
  // eslint-disable-next-line no-console
  console.log(`   - Login Attempts: ${profile._count.loginAttempts}`);
  // eslint-disable-next-line no-console
  console.log(`   - Notifications: ${profile._count.notifications}`);
  // eslint-disable-next-line no-console
  console.log(`   - Orders: ${profile._count.orders}`);
  // eslint-disable-next-line no-console
  console.log(`   - Refunds: ${profile._count.refunds}`);
  // eslint-disable-next-line no-console
  console.log(`   - Return Requests: ${profile._count.returnRequests}`);
  // eslint-disable-next-line no-console
  console.log(`   - Reviews: ${profile._count.reviews}`);
  // eslint-disable-next-line no-console
  console.log(`   - Subscriptions: ${profile._count.subscriptions}`);
  // eslint-disable-next-line no-console
  console.log(`   - Support Tickets: ${profile._count.supportTickets}`);
  // eslint-disable-next-line no-console
  console.log(`   - Wishlist Items: ${profile._count.wishlistItems}`);
  // eslint-disable-next-line no-console
  console.log(`   - Order History Entries: ${profile._count.orderHistoryEntries}`);
  // eslint-disable-next-line no-console
  console.log(`   - Referred Referrals: ${profile._count.referredReferrals}`);
  // eslint-disable-next-line no-console
  console.log(`   - Support Replies: ${profile._count.supportReplies}`);
  // eslint-disable-next-line no-console
  console.log(`   - Assigned Tickets: ${profile._count.assignedTickets}`);
  // eslint-disable-next-line no-console
  console.log(`   - User Action Logs: ${profile._count.userActionLogs}`);
  // eslint-disable-next-line no-console
  console.log(`   - Verification Attempts: ${profile._count.verificationAttempts}`);

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`\n⚠️  DRY RUN - No data will be deleted`);
    // eslint-disable-next-line no-console
    console.log(`   Run with --live to actually delete the account\n`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\n🗑️  Deleting account...`);

  // Delete the profile (cascade will handle all related records)
  await prisma.profile.delete({
    where: { id: profile.id },
  });

  // eslint-disable-next-line no-console
  console.log(`✅ Account successfully deleted for: ${email}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const dryRun = !args.includes("--live");

  if (!email) {
    // eslint-disable-next-line no-console
    console.error("Usage: tsx scripts/cleanup-account.ts <email> [--live]");
    // eslint-disable-next-line no-console
    console.error("Example: tsx scripts/cleanup-account.ts user@example.com --live");
    process.exit(1);
  }

  try {
    await cleanupAccount(email, dryRun);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
