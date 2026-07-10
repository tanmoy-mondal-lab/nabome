#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────
// ACCOUNT CLEANUP SCRIPT
// Removes all account-related data for a given email address
// ─────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupAccount(email: string, dryRun: boolean = true) {
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
    console.log(`❌ No profile found with email: ${email}`);
    return;
  }

  console.log(`📊 Found profile: ${profile.id}`);
  console.log(`   Name: ${profile.firstName} ${profile.lastName || ""}`);
  console.log(`   Role: ${profile.role}`);
  console.log(`   Created: ${profile.createdAt.toISOString()}`);
  console.log(`\n📦 Related data to be deleted:`);
  console.log(`   - Addresses: ${profile._count.addresses}`);
  console.log(`   - Sessions: ${profile._count.sessions}`);
  console.log(`   - Cart: ${profile.cart ? 1 : 0}`);
  console.log(`   - Loyalty Points: ${profile.loyaltyPoints ? 1 : 0}`);
  console.log(`   - Referral Code: ${profile.referralCode ? 1 : 0}`);
  console.log(`   - Coupon Redemptions: ${profile._count.couponRedemptions}`);
  console.log(`   - Purchased Gift Cards: ${profile._count.purchasedGiftCards}`);
  console.log(`   - Redeemed Gift Cards: ${profile._count.redeemedGiftCards}`);
  console.log(`   - Login Attempts: ${profile._count.loginAttempts}`);
  console.log(`   - Notifications: ${profile._count.notifications}`);
  console.log(`   - Orders: ${profile._count.orders}`);
  console.log(`   - Refunds: ${profile._count.refunds}`);
  console.log(`   - Return Requests: ${profile._count.returnRequests}`);
  console.log(`   - Reviews: ${profile._count.reviews}`);
  console.log(`   - Subscriptions: ${profile._count.subscriptions}`);
  console.log(`   - Support Tickets: ${profile._count.supportTickets}`);
  console.log(`   - Wishlist Items: ${profile._count.wishlistItems}`);
  console.log(`   - Order History Entries: ${profile._count.orderHistoryEntries}`);
  console.log(`   - Referred Referrals: ${profile._count.referredReferrals}`);
  console.log(`   - Support Replies: ${profile._count.supportReplies}`);
  console.log(`   - Assigned Tickets: ${profile._count.assignedTickets}`);
  console.log(`   - User Action Logs: ${profile._count.userActionLogs}`);
  console.log(`   - Verification Attempts: ${profile._count.verificationAttempts}`);

  if (dryRun) {
    console.log(`\n⚠️  DRY RUN - No data will be deleted`);
    console.log(`   Run with --live to actually delete the account\n`);
    return;
  }

  console.log(`\n🗑️  Deleting account...`);

  // Delete the profile (cascade will handle all related records)
  await prisma.profile.delete({
    where: { id: profile.id },
  });

  console.log(`✅ Account successfully deleted for: ${email}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const dryRun = !args.includes("--live");

  if (!email) {
    console.error("Usage: tsx scripts/cleanup-account.ts <email> [--live]");
    console.error("Example: tsx scripts/cleanup-account.ts user@example.com --live");
    process.exit(1);
  }

  try {
    await cleanupAccount(email, dryRun);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
