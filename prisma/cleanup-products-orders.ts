import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning products and orders (preserving categories, settings, CMS)...\n");

  const tables = [
    // Orders & related
    { name: "Webhook Events (order-related)", fn: () => prisma.webhookEvent.deleteMany() },
    { name: "Refunds", fn: () => prisma.refund.deleteMany() },
    { name: "Return Requests", fn: () => prisma.returnRequest.deleteMany() },
    { name: "Order Status History", fn: () => prisma.orderStatusHistory.deleteMany() },
    { name: "Order Items", fn: () => prisma.orderItem.deleteMany() },
    { name: "Coupon Redemptions", fn: () => prisma.couponRedemption.deleteMany() },
    { name: "Notifications (order-related)", fn: () => prisma.notification.deleteMany({ where: { orderId: { not: null } } }) },
    { name: "Orders", fn: () => prisma.order.deleteMany() },

    // Products & related
    { name: "Reviews", fn: () => prisma.review.deleteMany() },
    { name: "Related Products", fn: () => prisma.relatedProduct.deleteMany() },
    { name: "Product Label Assignments", fn: () => prisma.productLabelOnProduct.deleteMany() },
    { name: "Product Tag Assignments", fn: () => prisma.productTagOnProduct.deleteMany() },
    { name: "Product Images", fn: () => prisma.productImage.deleteMany() },
    { name: "Product Attributes", fn: () => prisma.productAttribute.deleteMany() },
    { name: "Inventory Movements", fn: () => prisma.inventoryMovement.deleteMany() },
    { name: "Inventory Alerts", fn: () => prisma.inventoryAlert.deleteMany() },
    { name: "Lookbook Items (product-linked)", fn: () => prisma.lookbookItem.deleteMany({ where: { productId: { not: null } } }) },
    { name: "Product Variants", fn: () => prisma.productVariant.deleteMany() },
    { name: "Products", fn: () => prisma.product.deleteMany() },

    // Cart & Wishlist (user data)
    { name: "Cart Items", fn: () => prisma.cartItem.deleteMany() },
    { name: "Carts", fn: () => prisma.cart.deleteMany() },
    { name: "Wishlist Items", fn: () => prisma.wishlistItem.deleteMany() },
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
      console.log(`  ⚠ ${table.name}: Skipped (${(err as Error).message?.slice(0, 60)})`);
    }
  }

  // Show what's preserved
  const counts = await Promise.all([
    prisma.category.count(),
    prisma.collection.count(),
    prisma.brand.count(),
    prisma.siteSetting.count(),
    prisma.homepageSection.count(),
    prisma.navigationMenu.count(),
  ]);

  console.log(`\n✅ Deleted ${totalDeleted} rows (products + orders + related).`);
  console.log("\n📋 Preserved:");
  console.log(`   Categories: ${counts[0]}, Collections: ${counts[1]}, Brands: ${counts[2]}`);
  console.log(`   Settings: ${counts[3]}, Homepage Sections: ${counts[4]}, Nav Menus: ${counts[5]}`);
  console.log("\n💡 Run 'npm run db:seed' to populate fresh sample products.");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
