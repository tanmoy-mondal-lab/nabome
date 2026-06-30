import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting comprehensive database cleanup...");
  console.log("⚠️  This will DELETE ALL data from the database!\n");

  // Clean all tables in dependency order
  const tables = [
    // Analytics & Logs
    { name: "Analytics Events", fn: () => prisma.analyticsEvent.deleteMany() },
    { name: "User Action Logs", fn: () => prisma.userActionLog.deleteMany() },
    { name: "Login Attempts", fn: () => prisma.loginAttempt.deleteMany() },
    { name: "Auth Sessions", fn: () => prisma.authSession.deleteMany() },

    // Notifications & Support
    { name: "Notification Templates", fn: () => prisma.notificationTemplate.deleteMany() },
    { name: "Notifications", fn: () => prisma.notification.deleteMany() },
    { name: "Support Ticket Replies", fn: () => prisma.supportTicketReply.deleteMany() },
    { name: "Support Tickets", fn: () => prisma.supportTicket.deleteMany() },
    { name: "FAQs", fn: () => prisma.fAQ.deleteMany() },

    // Webhooks
    { name: "Webhook Events", fn: () => prisma.webhookEvent.deleteMany() },

    // Returns & Refunds
    { name: "Refunds", fn: () => prisma.refund.deleteMany() },
    { name: "Return Requests", fn: () => prisma.returnRequest.deleteMany() },

    // Shipping
    { name: "Shipping Rates", fn: () => prisma.shippingRate.deleteMany() },
    { name: "Shipping Zones", fn: () => prisma.shippingZone.deleteMany() },

    // Inventory
    { name: "Inventory Movements", fn: () => prisma.inventoryMovement.deleteMany() },
    { name: "Inventory Alerts", fn: () => prisma.inventoryAlert.deleteMany() },

    // Orders
    { name: "Order Status History", fn: () => prisma.orderStatusHistory.deleteMany() },
    { name: "Order Items", fn: () => prisma.orderItem.deleteMany() },
    { name: "Orders", fn: () => prisma.order.deleteMany() },

    // Cart & Wishlist
    { name: "Cart Items", fn: () => prisma.cartItem.deleteMany() },
    { name: "Carts", fn: () => prisma.cart.deleteMany() },
    { name: "Wishlist Items", fn: () => prisma.wishlistItem.deleteMany() },

    // Reviews
    { name: "Reviews", fn: () => prisma.review.deleteMany() },

    // Products
    { name: "Related Products", fn: () => prisma.relatedProduct.deleteMany() },
    { name: "Product Label Assignments", fn: () => prisma.productLabelOnProduct.deleteMany() },
    { name: "Product Tag Assignments", fn: () => prisma.productTagOnProduct.deleteMany() },
    { name: "Product Images", fn: () => prisma.productImage.deleteMany() },
    { name: "Product Attributes", fn: () => prisma.productAttribute.deleteMany() },
    { name: "Product Variants", fn: () => prisma.productVariant.deleteMany() },
    { name: "Products", fn: () => prisma.product.deleteMany() },

    // Marketing
    { name: "Coupon Redemptions", fn: () => prisma.couponRedemption.deleteMany() },
    { name: "Coupons", fn: () => prisma.coupon.deleteMany() },
    { name: "Campaigns", fn: () => prisma.campaign.deleteMany() },
    { name: "Announcement Bars", fn: () => prisma.announcementBar.deleteMany() },

    // CMS
    { name: "Lookbook Items", fn: () => prisma.lookbookItem.deleteMany() },
    { name: "Lookbooks", fn: () => prisma.lookbook.deleteMany() },
    { name: "Static Pages", fn: () => prisma.staticPage.deleteMany() },
    { name: "Footer Sections", fn: () => prisma.footerSection.deleteMany() },
    { name: "Navigation Menus", fn: () => prisma.navigationMenu.deleteMany() },
    { name: "Homepage Sections", fn: () => prisma.homepageSection.deleteMany() },
    { name: "Page Templates", fn: () => prisma.pageTemplate.deleteMany() },

    // Settings & Media
    { name: "Contact Submissions", fn: () => prisma.contactSubmission.deleteMany() },
    { name: "Newsletter Subscribers", fn: () => prisma.newsletterSubscriber.deleteMany() },
    { name: "Social Media Links", fn: () => prisma.socialMediaLink.deleteMany() },
    { name: "Media Assets", fn: () => prisma.mediaAsset.deleteMany() },
    { name: "Site Settings", fn: () => prisma.siteSetting.deleteMany() },

    // Categories & Taxonomy
    { name: "Product Tags", fn: () => prisma.productTag.deleteMany() },
    { name: "Product Labels", fn: () => prisma.productLabel.deleteMany() },
    { name: "Size Guides", fn: () => prisma.sizeGuide.deleteMany() },
    { name: "Brands", fn: () => prisma.brand.deleteMany() },
    { name: "Subcategories", fn: () => prisma.subcategory.deleteMany() },
    { name: "Categories", fn: () => prisma.category.deleteMany() },
    { name: "Collections", fn: () => prisma.collection.deleteMany() },
  ];

  let totalDeleted = 0;
  for (const table of tables) {
    try {
      const result = await table.fn();
      if (result.count > 0) {
        console.log(`  ✓ ${table.name}: ${result.count} rows deleted`);
        totalDeleted += result.count;
      }
    } catch (err) {
      console.log(`  ⚠ ${table.name}: Skipped (table may not exist)`);
    }
  }

  console.log(`\n✅ Cleanup complete! ${totalDeleted} total rows deleted.`);
  console.log("\n📋 Next steps:");
  console.log("   1. Run 'npm run db:seed' to populate with fresh sample data");
  console.log("   2. Run 'npm run prisma:studio' to inspect the database");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
