import { readFileSync, writeFileSync } from 'fs';

const replacements = [
  ['prisma.product_label_on_product', 'prisma.product_labels_products'], // no match, skip
  ['prisma.product_tag_on_product', 'prisma.product_tags_products'],     // no match, skip
];

// All wrong camelCase -> correct snake_case mappings
// Sorted by wrong-name length (longest first) to avoid partial matches
const RENAMES = [
  ['.notificationTemplate', '.notification_templates'],
  ['.newsletterSubscriber', '.newsletter_subscribers'],
  ['.verificationAttempt', '.verification_attempts'],
  ['.inventoryMovement', '.inventory_movements'],
  ['.inventoryAlert', '.inventory_alerts'],
  ['.homepageSection', '.homepage_sections'],
  ['.footerSection', '.footer_sections'],
  ['.announcementBar', '.announcement_bars'],
  ['.contactSubmission', '.contact_submissions'],
  ['.couponRedemption', '.coupon_redemptions'],
  ['.deadLetterQueue', '.dead_letter_queue'],
  ['.navigationMenu', '.navigation_menus'],
  ['.loyaltyTransaction', '.loyalty_transactions'],
  ['.orderStatusHistory', '.order_status_history'],
  ['.socialMediaLink', '.social_media_links'],
  ['.subscriptionInvoice', '.subscription_invoices'],
  ['.subscriptionPlan', '.subscription_plans'],
  ['.supportTicketReply', '.support_ticket_replies'],
  ['.pageTemplate', '.page_templates'],
  ['.productAttribute', '.product_attributes'],
  ['.productLabelOnProduct', '.product_labels_products'],
  ['.productTagOnProduct', '.product_tags_products'],
  ['.lookbookItem', '.lookbook_items'],
  ['.loyaltyPoints', '.loyalty_points'],
  ['.loyaltyTier', '.loyalty_tiers'],
  ['.relatedProduct', '.related_products'],
  ['.returnRequest', '.return_requests'],
  ['.siteSetting', '.site_settings'],
  ['.referralCode', '.referral_codes'],
  ['.webhookEvent', '.webhook_events'],
  ['.wishlistItem', '.wishlist_items'],
  ['.mediaAsset', '.media_assets'],
  ['.sizeGuide', '.size_guides'],
  ['.staticPage', '.static_pages'],
  ['.productImage', '.product_images'],
  ['.productLabel', '.product_labels'],
  ['.productTag', '.product_tags'],
  ['.productVariant', '.product_variants'],
  ['.authSession', '.auth_sessions'],
  ['.loginAttempt', '.login_attempts'],
  ['.jobQueue', '.job_queue'],
  ['.userActionLog', '.user_action_logs'],
  ['.cartItem', '.cart_items'],
  ['.orderItem', '.order_items'],
  ['.apiKey', '.api_keys'],
  ['.giftCard', '.gift_cards'],
  ['.supportTicket', '.support_tickets'],
  // Single-word models (prone to substring issues, order matters!)
  ['.address', '.addresses'],
  ['.coupon', '.coupons'],
  ['.currency', '.currencies'],
  ['.category', '.categories'],
  ['.collection', '.collections'],
  ['.notification', '.notifications'],
  ['.subcategory', '.subcategories'],
  ['.subscription', '.subscriptions'],
  ['.referral', '.referrals'],
  ['.profile', '.profiles'],
  ['.product', '.products'],
  ['.order', '.orders'],
  ['.brand', '.brands'],
  ['.campaign', '.campaigns'],
  ['.cart', '.carts'],
  ['.lookbook', '.lookbooks'],
  ['.refund', '.refunds'],
  ['.review', '.reviews'],
  ['.searchHistory', '.search_history'],
  ['.trendingSearch', '.trending_searches'],
  ['.fAQ', '.faqs'],
];

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let original = content;

  for (const [wrong, correct] of RENAMES) {
    const baseWrong = wrong.slice(1);
    // Replace prisma.<wrongWord> or tx.<wrongWord>
    const regex = new RegExp(`((?:prisma|tx|mockPrisma)\\.)${escapeRegex(baseWrong)}(?=\\W|$)`, 'g');
    content = content.replace(regex, (match, prefix) => `${prefix}${correct.slice(1)}`);
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { execSync } from 'child_process';

const dirs = [
  '/Users/tanmoymondal/nabome/api',
  '/Users/tanmoymondal/nabome/src',
];

let fixedCount = 0;
let fileCount = 0;

for (const dir of dirs) {
  const result = execSync(`find "${dir}" -name "*.ts" -not -path "*/node_modules/*"`, { encoding: 'utf8' });
  const files = result.trim().split('\n').filter(Boolean);
  
  for (const file of files) {
    if (fixFile(file)) {
      console.log(`Fixed: ${file}`);
      fileCount++;
    }
  }
}

console.log(`\nDone! Fixed ${fileCount} files with Prisma model name mismatches.`);
