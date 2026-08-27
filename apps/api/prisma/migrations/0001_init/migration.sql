-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('guest', 'customer', 'shop_owner', 'admin', 'system');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned', 'pending_verification');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'backorder');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'archived', 'failed_delivery', 'held', 'awaiting_payment', 'partially_shipped', 'partially_delivered', 'partially_cancelled', 'partially_returned', 'partially_refunded', 'ready_for_pickup');

-- CreateEnum
CREATE TYPE "CustomerVisibleOrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'held', 'failed_delivery');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'succeeded', 'created', 'initiated', 'authorized', 'captured', 'completed', 'failed', 'cancelled', 'expired', 'partially_refunded', 'refunded', 'refunding');

-- CreateEnum
CREATE TYPE "OrderPaymentSubStatus" AS ENUM ('pending', 'authorized', 'captured', 'refunding', 'refunded', 'failed', 'awaiting_bank_confirmation', 'awaiting_upi_confirmation', 'awaiting_authorization', 'awaiting_capture');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'initiated', 'completed', 'settled');

-- CreateEnum
CREATE TYPE "RefundType" AS ENUM ('full', 'partial');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('pending', 'eligible', 'created', 'review', 'approved', 'processing', 'completed', 'paid', 'rejected', 'failed', 'reversed', 'settled', 'on_hold', 'cancelled', 'initiated', 'retry_pending', 'partially_settled', 'manual_review');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('pending', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('digital', 'manual');

-- CreateEnum
CREATE TYPE "PayoutAccountType" AS ENUM ('upi', 'bank');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('queued', 'processing', 'completed', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "CommissionScope" AS ENUM ('platform', 'shop', 'category');

-- CreateEnum
CREATE TYPE "FinanceRecordType" AS ENUM ('sale', 'commission', 'hold', 'release', 'settlement', 'refund', 'reversal', 'adjustment', 'cod_collected', 'gateway_fee');

-- CreateEnum
CREATE TYPE "FinanceRecordStatus" AS ENUM ('pending', 'posted', 'reversed');

-- CreateEnum
CREATE TYPE "LedgerSide" AS ENUM ('debit', 'credit');

-- CreateEnum
CREATE TYPE "LedgerAccount" AS ENUM ('seller_payable', 'commission_income', 'cash', 'refunds', 'gateway_fees', 'cod_payable', 'shipping_income', 'adjustments');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('authorize', 'capture', 'refund', 'void');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('received', 'processing', 'processed', 'failed');

-- CreateEnum
CREATE TYPE "CodOrderStatus" AS ENUM ('awaiting_pickup', 'in_transit', 'delivered', 'failed', 'paid_to_seller');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('shipment_created', 'ready_to_pack', 'packed', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed', 'exception', 'returned_to_sender', 'cancelled', 'closed');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('men', 'women', 'unisex');

-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('manual', 'dynamic', 'smart');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('home', 'work', 'other');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'upi', 'netbanking', 'wallet', 'cod');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_update', 'shipment_update', 'payment_update', 'promotional', 'system');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'sms', 'push', 'in_app');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('unread', 'read');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('percentage', 'fixed', 'free_shipping');

-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM ('started', 'address_entered', 'payment_pending', 'payment_processing', 'completed', 'abandoned', 'expired');

-- CreateEnum
CREATE TYPE "ReturnRequestStatus" AS ENUM ('return_requested', 'return_approved', 'return_rejected', 'pickup_scheduled', 'pickup_completed', 'in_inspection', 'inspection_passed', 'inspection_failed', 'refund_pending', 'refund_approved', 'refund_completed', 'return_closed');

-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('full_order', 'partial_return', 'variant_return', 'quantity_return', 'exchange', 'replacement');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('original_payment', 'store_credit', 'bank_transfer', 'upi', 'wallet');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('passed', 'failed', 'partial', 'pending');

-- CreateEnum
CREATE TYPE "InspectionFailureReason" AS ENUM ('damaged_beyond_repair', 'missing_parts', 'used_worn', 'different_item', 'counterfeit', 'tampered', 'exceeded_return_window', 'no_proof_of_purchase', 'other');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'under_review', 'escalated', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "DisputeResolution" AS ENUM ('customer_favored', 'seller_favored', 'partial_refund', 'full_refund', 'replacement', 'exchange', 'rejected');

-- CreateEnum
CREATE TYPE "ReturnPolicyType" AS ENUM ('standard', 'extended', 'no_returns', 'final_sale');

-- CreateEnum
CREATE TYPE "ReverseLogisticsStatus" AS ENUM ('awaiting_pickup', 'pickup_scheduled', 'pickup_assigned', 'in_transit', 'warehouse_received', 'inspection_queued', 'inspection_in_progress', 'inspection_completed', 'restocking', 'disposal', 'completed');

-- CreateEnum
CREATE TYPE "RestockStatus" AS ENUM ('pending', 'in_progress', 'completed', 'cannot_restock');

-- CreateEnum
CREATE TYPE "DispositionAction" AS ENUM ('restock', 'refurbish', 'repair', 'dispose', 'return_to_vendor', 'donate', 'hold');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('order_created', 'payment_initiated', 'payment_completed', 'payment_failed', 'order_confirmed', 'order_processing', 'order_packed', 'order_ready_for_shipment', 'order_shipped', 'order_delivered', 'order_cancelled', 'return_requested', 'return_approved', 'return_rejected', 'return_completed', 'refund_initiated', 'refund_completed', 'refund_failed', 'note_added', 'status_updated');

-- CreateEnum
CREATE TYPE "TimelineEventPriority" AS ENUM ('low', 'normal', 'high', 'critical');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('initial_stock', 'purchase', 'sale', 'reservation', 'release', 'return', 'refund', 'damage', 'adjustment', 'transfer', 'manual_update');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('active', 'released', 'expired', 'converted');

-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('active', 'inactive', 'maintenance');

-- CreateEnum
CREATE TYPE "CarrierType" AS ENUM ('manual', 'shiprocket', 'delhivery', 'bluedart', 'dtdc', 'ekart', 'india_post', 'dhl', 'fedex', 'ups', 'custom');

-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('standard', 'express', 'same_day', 'pickup', 'international');

-- CreateEnum
CREATE TYPE "TrackingEventType" AS ENUM ('shipment_created', 'ready_to_pack', 'packed', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed', 'exception', 'returned_to_sender', 'cancelled');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('customer', 'shop_owner', 'admin', 'courier', 'system');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('standard', 'fragile', 'oversized', 'liquid', 'perishable');

-- CreateEnum
CREATE TYPE "DeliveryConfirmationType" AS ENUM ('signature', 'photo', 'otp', 'none');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('weather', 'address_issue', 'customs_hold', 'damage', 'lost', 'delayed', 'recipient_unavailable', 'other');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('damaged', 'wrong_item', 'not_as_described', 'no_longer_needed', 'defective', 'arrived_late', 'other');

-- CreateEnum
CREATE TYPE "CarrierStatus" AS ENUM ('active', 'inactive', 'maintenance', 'disabled');

-- CreateEnum
CREATE TYPE "RateCalculationStatus" AS ENUM ('success', 'failed', 'pending');

-- CreateEnum
CREATE TYPE "LabelGenerationStatus" AS ENUM ('success', 'failed', 'pending');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(20),
    "firstName" VARCHAR(120),
    "lastName" VARCHAR(120),
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "emailVerifiedAt" TIMESTAMPTZ(6),
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-IN',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "csrfToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failureReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'home',
    "label" VARCHAR(60),
    "line1" VARCHAR(255) NOT NULL,
    "line2" VARCHAR(255),
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(120) NOT NULL,
    "postalCode" VARCHAR(12) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'IN',
    "phone" VARCHAR(20) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "parentId" UUID,
    "iconUrl" TEXT,
    "banner" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" VARCHAR(300),
    "metaDescription" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "type" "CollectionType" NOT NULL DEFAULT 'manual',
    "startsAt" TIMESTAMPTZ(6),
    "endsAt" TIMESTAMPTZ(6),
    "metaTitle" VARCHAR(300),
    "metaDescription" VARCHAR(500),
    "rules" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "brandId" UUID,
    "shopId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(190) NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "gender" "Gender" NOT NULL DEFAULT 'unisex',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "costPrice" DECIMAL(10,2),
    "weightGrams" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" VARCHAR(300),
    "metaDescription" VARCHAR(500),
    "ogImage" TEXT,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalSold" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "meta" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "sku" VARCHAR(120) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "attributes" JSON,
    "price" DECIMAL(10,2) NOT NULL,
    "compareAtPrice" DECIMAL(10,2),
    "availableStock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "inventoryStatus" "InventoryStatus" NOT NULL DEFAULT 'out_of_stock',
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantId" UUID,
    "type" VARCHAR(20) NOT NULL DEFAULT 'image',
    "url" TEXT NOT NULL,
    "altText" VARCHAR(255),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "value" VARCHAR(255) NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_collections" (
    "productId" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_collections_pkey" PRIMARY KEY ("productId","collectionId")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "body" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "guestId" VARCHAR(64),
    "productId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "priceSnapshot" JSON,
    "variantSnapshot" JSON,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "reservationId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL DEFAULT 'Default',
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" VARCHAR(64),
    "shareExpiresAt" TIMESTAMPTZ(6),
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" UUID NOT NULL,
    "wishlistId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantId" UUID,
    "priceSnapshot" DECIMAL(10,2),
    "addedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "userId" UUID,
    "status" "CheckoutStatus" NOT NULL DEFAULT 'started',
    "shippingAddressId" UUID,
    "billingAddressId" UUID,
    "shippingRateId" UUID,
    "shippingFee" DECIMAL(10,2),
    "totals" JSON,
    "couponCode" VARCHAR(60),
    "couponDiscount" DECIMAL(10,2),
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "baseRate" DECIMAL(10,2) NOT NULL,
    "ratePerKg" DECIMAL(10,2),
    "freeAboveAmount" DECIMAL(10,2),
    "estimatedDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableRegions" JSON,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "isInclusive" BOOLEAN NOT NULL DEFAULT false,
    "applicableRegions" JSON,
    "applicableCategories" JSON,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "orderNumber" VARCHAR(30) NOT NULL,
    "userId" UUID NOT NULL,
    "shopId" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "customerVisibleStatus" "CustomerVisibleOrderStatus" NOT NULL DEFAULT 'pending',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentSubStatus" "OrderPaymentSubStatus",
    "refundStatus" "RefundStatus",
    "shipmentStatus" "ShipmentStatus",
    "settlementStatus" "SettlementStatus",
    "itemsSubtotal" DECIMAL(10,2) NOT NULL,
    "shippingTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "billingAddressId" UUID,
    "shippingAddressId" UUID,
    "billingSnapshot" JSON,
    "shippingSnapshot" JSON,
    "paymentMethod" "PaymentMethod",
    "razorpayOrderId" VARCHAR(64),
    "razorpayPaymentId" VARCHAR(64),
    "couponCode" VARCHAR(60),
    "notes" TEXT,
    "placedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "commissionRate" DECIMAL(5,2),
    "commissionAmount" DECIMAL(10,2),
    "commissionSnapshot" JSON,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "variantName" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(120) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "discountTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'shipment_created',
    "trackingNumber" VARCHAR(120),
    "carrierCode" VARCHAR(120),
    "carrierName" VARCHAR(255),
    "shippingMethod" "ShippingMethod" NOT NULL DEFAULT 'standard',
    "estimatedDeliveryDate" TIMESTAMPTZ(6),
    "actualDeliveryDate" TIMESTAMPTZ(6),
    "shippedAt" TIMESTAMPTZ(6),
    "deliveredAt" TIMESTAMPTZ(6),
    "weight" INTEGER NOT NULL DEFAULT 0,
    "length" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "shippingAddress" JSON NOT NULL,
    "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_items" (
    "id" UUID NOT NULL,
    "shipmentId" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "variantSku" VARCHAR(120) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "packageType" "PackageType" NOT NULL DEFAULT 'standard',
    "isFragile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_events" (
    "id" UUID NOT NULL,
    "shipmentId" UUID NOT NULL,
    "status" "TrackingEventType" NOT NULL,
    "location" VARCHAR(255),
    "description" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" UUID,
    "metadata" JSON,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" UUID NOT NULL,
    "code" "CarrierType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "status" "CarrierStatus" NOT NULL DEFAULT 'active',
    "apiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSON NOT NULL,
    "trackingUrlTemplate" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_queue" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "shipmentId" UUID,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" UUID,
    "assignedAt" TIMESTAMPTZ(6),
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "metadata" JSON,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fulfillment_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pick_list_items" (
    "id" UUID NOT NULL,
    "fulfillmentQueueId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "variantSku" VARCHAR(120) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "picked" BOOLEAN NOT NULL DEFAULT false,
    "pickedAt" TIMESTAMPTZ(6),
    "pickedBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pick_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_labels" (
    "id" UUID NOT NULL,
    "shipmentId" UUID NOT NULL,
    "carrierCode" "CarrierType" NOT NULL,
    "trackingNumber" VARCHAR(120) NOT NULL,
    "labelUrl" VARCHAR(500),
    "labelData" TEXT,
    "status" "LabelGenerationStatus" NOT NULL DEFAULT 'pending',
    "generatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" UUID NOT NULL,

    CONSTRAINT "shipping_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_exceptions" (
    "id" UUID NOT NULL,
    "shipmentId" UUID NOT NULL,
    "exceptionType" "ExceptionType" NOT NULL,
    "description" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedBy" UUID,
    "resolution" TEXT,
    "metadata" JSON,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shipping_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_confirmations" (
    "id" UUID NOT NULL,
    "shipmentId" UUID NOT NULL,
    "confirmationType" "DeliveryConfirmationType" NOT NULL,
    "confirmedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedBy" UUID NOT NULL,
    "signature" TEXT,
    "photoUrl" VARCHAR(500),
    "otp" VARCHAR(20),
    "metadata" JSON,

    CONSTRAINT "delivery_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "provider" VARCHAR(40),
    "gatewayReference" VARCHAR(120),
    "razorpayOrderId" VARCHAR(64),
    "razorpayPaymentId" VARCHAR(64),
    "razorpaySignature" VARCHAR(255),
    "failureReason" TEXT,
    "expiresAt" TIMESTAMPTZ(6),
    "idempotencyKey" VARCHAR(120),
    "metadata" JSON,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "paymentId" UUID,
    "type" "RefundType" NOT NULL DEFAULT 'partial',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "RefundStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "gatewayReference" VARCHAR(120),
    "idempotencyKey" VARCHAR(120),
    "completedAt" TIMESTAMPTZ(6),
    "razorpayRefundId" VARCHAR(64),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_requests" (
    "id" UUID NOT NULL,
    "orderNumber" VARCHAR(30) NOT NULL,
    "orderId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "status" "ReturnRequestStatus" NOT NULL DEFAULT 'return_requested',
    "returnType" "ReturnType" NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "reasonDetail" TEXT,
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMPTZ(6),
    "rejectedAt" TIMESTAMPTZ(6),
    "rejectedReason" TEXT,
    "approvedBy" UUID,
    "rejectedBy" UUID,
    "totalRefundAmount" DECIMAL(10,2) NOT NULL,
    "refundMethod" "RefundMethod" NOT NULL,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'pending',
    "refundCompletedAt" TIMESTAMPTZ(6),
    "refundGatewayRef" VARCHAR(120),
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_items" (
    "id" UUID NOT NULL,
    "returnRequestId" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "variantSku" VARCHAR(120) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "reasonDetail" TEXT,
    "condition" VARCHAR(255) NOT NULL,
    "inspectionResult" "InspectionResult",
    "inspectionFailureReason" "InspectionFailureReason",
    "inspectedAt" TIMESTAMPTZ(6),
    "inspectedBy" UUID,
    "dispositionAction" "DispositionAction",
    "restockStatus" "RestockStatus",
    "restockedAt" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_status_history" (
    "id" UUID NOT NULL,
    "returnRequestId" UUID NOT NULL,
    "fromStatus" "ReturnRequestStatus" NOT NULL,
    "toStatus" "ReturnRequestStatus" NOT NULL,
    "actorId" UUID NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_refunds" (
    "id" UUID NOT NULL,
    "returnRequestId" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "RefundStatus" NOT NULL DEFAULT 'pending',
    "method" "RefundMethod" NOT NULL,
    "reason" TEXT NOT NULL,
    "gatewayRef" VARCHAR(120),
    "gatewayStatus" VARCHAR(120),
    "initiatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),
    "failedAt" TIMESTAMPTZ(6),
    "failureReason" TEXT,
    "initiatedBy" UUID NOT NULL,
    "completedBy" UUID,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "return_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" UUID NOT NULL,
    "returnRequestId" UUID NOT NULL,
    "returnItemId" UUID NOT NULL,
    "inspectedBy" UUID NOT NULL,
    "inspectedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "InspectionResult" NOT NULL,
    "failureReason" "InspectionFailureReason",
    "conditionNotes" TEXT,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dispositionAction" "DispositionAction" NOT NULL,
    "restockable" BOOLEAN NOT NULL,
    "refurbishable" BOOLEAN NOT NULL,
    "repairable" BOOLEAN NOT NULL,
    "disposalReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reverse_logistics" (
    "id" UUID NOT NULL,
    "returnRequestId" UUID NOT NULL,
    "status" "ReverseLogisticsStatus" NOT NULL DEFAULT 'awaiting_pickup',
    "pickupAddress" JSON NOT NULL,
    "pickupScheduledAt" TIMESTAMPTZ(6),
    "pickupCompletedAt" TIMESTAMPTZ(6),
    "pickupCourier" VARCHAR(255),
    "trackingNumber" VARCHAR(120),
    "warehouseId" UUID,
    "warehouseReceivedAt" TIMESTAMPTZ(6),
    "inspectionQueuedAt" TIMESTAMPTZ(6),
    "inspectionStartedAt" TIMESTAMPTZ(6),
    "inspectionCompletedAt" TIMESTAMPTZ(6),
    "restockingStartedAt" TIMESTAMPTZ(6),
    "restockingCompletedAt" TIMESTAMPTZ(6),
    "disposalCompletedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reverse_logistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL,
    "returnRequestId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "raisedBy" UUID NOT NULL,
    "raisedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "reasonDetail" TEXT,
    "resolution" "DisputeResolution",
    "resolvedBy" UUID,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolutionNotes" TEXT,
    "escalatedBy" UUID,
    "escalatedAt" TIMESTAMPTZ(6),
    "escalationReason" TEXT,
    "internalNotes" TEXT,
    "customerVisibleNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" UUID NOT NULL,
    "disputeId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "senderType" "ActorType" NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_policies" (
    "id" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "policyType" "ReturnPolicyType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "returnWindowDays" INTEGER NOT NULL,
    "eligibleProductCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ineligibleProductCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "requiresOriginalPackaging" BOOLEAN NOT NULL DEFAULT true,
    "requiresProofOfPurchase" BOOLEAN NOT NULL DEFAULT true,
    "customerPaysReturnShipping" BOOLEAN NOT NULL DEFAULT false,
    "restockingFeePercentage" DECIMAL(5,2),
    "maxReturnsPerOrder" INTEGER,
    "maxReturnsPerCustomer" INTEGER,
    "maxReturnsPerPeriod" INTEGER,
    "returnPeriodDays" INTEGER,
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "return_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TimelineEventPriority" NOT NULL DEFAULT 'normal',
    "customerVisible" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "performedBy" UUID,
    "performedByType" VARCHAR(50),
    "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "address" TEXT NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(120) NOT NULL,
    "postalCode" VARCHAR(12) NOT NULL,
    "country" VARCHAR(2) NOT NULL DEFAULT 'IN',
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "status" "WarehouseStatus" NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "warehouseId" UUID,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "reason" TEXT,
    "referenceId" VARCHAR(255),
    "referenceType" VARCHAR(50),
    "performedBy" UUID,
    "performedByType" VARCHAR(50),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "warehouseId" UUID,
    "orderId" UUID,
    "cartId" VARCHAR(64),
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "releasedAt" TIMESTAMPTZ(6),
    "convertedAt" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "low_stock_alerts" (
    "id" UUID NOT NULL,
    "variantId" UUID NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" UUID,
    "acknowledgedAt" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "low_stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_settings" (
    "id" UUID NOT NULL,
    "shopId" UUID,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "reservationTimeout" INTEGER NOT NULL DEFAULT 15,
    "enableAutoRestock" BOOLEAN NOT NULL DEFAULT false,
    "restockThreshold" INTEGER,
    "restockQuantity" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "type" "CouponType" NOT NULL DEFAULT 'percentage',
    "value" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "minOrderAmount" DECIMAL(10,2),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMPTZ(6),
    "validUntil" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'order_update',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'in_app',
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'unread',
    "readAt" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_documents" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "categoryName" VARCHAR(120),
    "brand" VARCHAR(120),
    "tags" TEXT[],
    "price" DECIMAL(10,2),
    "rating" DECIMAL(3,2),
    "reviewCount" INTEGER,
    "stockStatus" VARCHAR(50),
    "popularityScore" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recencyScore" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "businessBoost" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "attributes" JSONB,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "guestId" VARCHAR(64),
    "query" VARCHAR(200) NOT NULL,
    "results" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_searches" (
    "id" UUID NOT NULL,
    "query" VARCHAR(200) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "window" VARCHAR(10) NOT NULL DEFAULT '7d',
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trending_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "status" "ShopStatus" NOT NULL DEFAULT 'pending',
    "payoutMethod" "PayoutMethod" NOT NULL DEFAULT 'digital',
    "payoutDetails" JSON,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_accounts" (
    "id" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "type" "PayoutAccountType" NOT NULL,
    "details" JSON NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payout_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "type" "PaymentTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'pending',
    "gatewayReference" VARCHAR(120),
    "gatewayResponse" JSON,
    "failureCode" VARCHAR(80),
    "failureMessage" TEXT,
    "idempotencyKey" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(40) NOT NULL,
    "eventId" VARCHAR(120) NOT NULL,
    "eventType" VARCHAR(80) NOT NULL,
    "payloadHash" VARCHAR(64) NOT NULL,
    "payload" TEXT,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'received',
    "failureReason" TEXT,
    "processedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_records" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "recordNumber" VARCHAR(30) NOT NULL,
    "type" "FinanceRecordType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "FinanceRecordStatus" NOT NULL DEFAULT 'pending',
    "referenceType" VARCHAR(50),
    "referenceId" UUID,
    "metadata" JSON,
    "postedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" UUID NOT NULL,
    "financeRecordId" UUID NOT NULL,
    "account" "LedgerAccount" NOT NULL,
    "side" "LedgerSide" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" UUID NOT NULL,
    "settlementNumber" VARCHAR(30) NOT NULL,
    "shopId" UUID NOT NULL,
    "periodStart" TIMESTAMPTZ(6) NOT NULL,
    "periodEnd" TIMESTAMPTZ(6) NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'pending',
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refundAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "payoutMethod" "PayoutMethod" NOT NULL DEFAULT 'digital',
    "payoutReference" VARCHAR(120),
    "payoutGatewayReference" VARCHAR(120),
    "approvalReason" TEXT,
    "rejectionReason" TEXT,
    "approvedBy" UUID,
    "approvedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "paidAt" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_items" (
    "id" UUID NOT NULL,
    "settlementId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "refundAdjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "settlement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_rates" (
    "id" UUID NOT NULL,
    "scope" "CommissionScope" NOT NULL,
    "shopId" UUID,
    "categoryId" UUID,
    "rate" DECIMAL(4,2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "commission_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "settlementId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "payoutAccountId" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PayoutStatus" NOT NULL DEFAULT 'queued',
    "batchReference" VARCHAR(120),
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cod_orders" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "codLimit" DECIMAL(10,2) NOT NULL,
    "status" "CodOrderStatus" NOT NULL DEFAULT 'awaiting_pickup',
    "cashCollected" DECIMAL(10,2),
    "collectedAt" TIMESTAMPTZ(6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cod_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_payment_methods" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "PaymentMethod" NOT NULL,
    "providerTokenHash" VARCHAR(64) NOT NULL,
    "displayLabel" VARCHAR(100) NOT NULL,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "theme" VARCHAR(20) NOT NULL DEFAULT 'auto',
    "locale" VARCHAR(10) NOT NULL DEFAULT 'en-IN',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "profileVisibility" BOOLEAN NOT NULL DEFAULT true,
    "showActivityStatus" BOOLEAN NOT NULL DEFAULT true,
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "allowPersonalization" BOOLEAN NOT NULL DEFAULT true,
    "emailConsent" BOOLEAN NOT NULL DEFAULT false,
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "pushConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "customer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
    "shipmentUpdates" BOOLEAN NOT NULL DEFAULT true,
    "paymentUpdates" BOOLEAN NOT NULL DEFAULT true,
    "promotional" BOOLEAN NOT NULL DEFAULT false,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "viewedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "login_history_createdAt_idx" ON "login_history"("createdAt");

-- CreateIndex
CREATE INDEX "login_history_success_idx" ON "login_history"("success");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_userId_idx" ON "password_resets"("userId");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_expiresAt_idx" ON "password_resets"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "email_verifications_userId_idx" ON "email_verifications"("userId");

-- CreateIndex
CREATE INDEX "email_verifications_token_idx" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "email_verifications_expiresAt_idx" ON "email_verifications"("expiresAt");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");

-- CreateIndex
CREATE INDEX "categories_isHidden_idx" ON "categories"("isHidden");

-- CreateIndex
CREATE INDEX "categories_parentId_sortOrder_idx" ON "categories"("parentId", "sortOrder");

-- CreateIndex
CREATE INDEX "categories_isActive_parentId_idx" ON "categories"("isActive", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "collections_name_key" ON "collections"("name");

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_isActive_idx" ON "collections"("isActive");

-- CreateIndex
CREATE INDEX "collections_isFeatured_idx" ON "collections"("isFeatured");

-- CreateIndex
CREATE INDEX "collections_type_idx" ON "collections"("type");

-- CreateIndex
CREATE INDEX "collections_startsAt_endsAt_idx" ON "collections"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "collections_isActive_isFeatured_idx" ON "collections"("isActive", "isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_brandId_idx" ON "products"("brandId");

-- CreateIndex
CREATE INDEX "products_shopId_idx" ON "products"("shopId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_status_isFeatured_idx" ON "products"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "products_status_isNew_idx" ON "products"("status", "isNew");

-- CreateIndex
CREATE INDEX "products_status_isTrending_idx" ON "products"("status", "isTrending");

-- CreateIndex
CREATE INDEX "products_status_gender_createdAt_idx" ON "products"("status", "gender", "createdAt");

-- CreateIndex
CREATE INDEX "products_status_categoryId_sortOrder_idx" ON "products"("status", "categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "products_status_basePrice_idx" ON "products"("status", "basePrice");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- CreateIndex
CREATE INDEX "products_sortOrder_idx" ON "products"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_isActive_idx" ON "product_variants"("productId", "isActive");

-- CreateIndex
CREATE INDEX "product_variants_isActive_availableStock_idx" ON "product_variants"("isActive", "availableStock");

-- CreateIndex
CREATE INDEX "product_variants_inventoryStatus_idx" ON "product_variants"("inventoryStatus");

-- CreateIndex
CREATE INDEX "product_media_productId_idx" ON "product_media"("productId");

-- CreateIndex
CREATE INDEX "product_attributes_productId_idx" ON "product_attributes"("productId");

-- CreateIndex
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");

-- CreateIndex
CREATE INDEX "cart_items_guestId_idx" ON "cart_items"("guestId");

-- CreateIndex
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- CreateIndex
CREATE INDEX "cart_items_variantId_idx" ON "cart_items"("variantId");

-- CreateIndex
CREATE INDEX "cart_items_reservationId_idx" ON "cart_items"("reservationId");

-- CreateIndex
CREATE INDEX "cart_items_isActive_idx" ON "cart_items"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_variantId_key" ON "cart_items"("userId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_shareToken_key" ON "wishlists"("shareToken");

-- CreateIndex
CREATE INDEX "wishlists_userId_idx" ON "wishlists"("userId");

-- CreateIndex
CREATE INDEX "wishlists_shareToken_idx" ON "wishlists"("shareToken");

-- CreateIndex
CREATE INDEX "wishlists_isActive_idx" ON "wishlists"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_userId_name_key" ON "wishlists"("userId", "name");

-- CreateIndex
CREATE INDEX "wishlist_items_wishlistId_idx" ON "wishlist_items"("wishlistId");

-- CreateIndex
CREATE INDEX "wishlist_items_productId_idx" ON "wishlist_items"("productId");

-- CreateIndex
CREATE INDEX "wishlist_items_variantId_idx" ON "wishlist_items"("variantId");

-- CreateIndex
CREATE INDEX "wishlist_items_addedAt_idx" ON "wishlist_items"("addedAt");

-- CreateIndex
CREATE INDEX "wishlist_items_isActive_idx" ON "wishlist_items"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_wishlistId_productId_variantId_key" ON "wishlist_items"("wishlistId", "productId", "variantId");

-- CreateIndex
CREATE INDEX "checkout_sessions_cartId_idx" ON "checkout_sessions"("cartId");

-- CreateIndex
CREATE INDEX "checkout_sessions_userId_idx" ON "checkout_sessions"("userId");

-- CreateIndex
CREATE INDEX "checkout_sessions_status_idx" ON "checkout_sessions"("status");

-- CreateIndex
CREATE INDEX "checkout_sessions_expiresAt_idx" ON "checkout_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "shipping_rates_isActive_idx" ON "shipping_rates"("isActive");

-- CreateIndex
CREATE INDEX "tax_rules_type_idx" ON "tax_rules"("type");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_shopId_idx" ON "orders"("shopId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_placedAt_idx" ON "orders"("placedAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipments_orderId_idx" ON "shipments"("orderId");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_trackingNumber_idx" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipments_carrierCode_idx" ON "shipments"("carrierCode");

-- CreateIndex
CREATE INDEX "shipment_items_shipmentId_idx" ON "shipment_items"("shipmentId");

-- CreateIndex
CREATE INDEX "shipment_items_orderItemId_idx" ON "shipment_items"("orderItemId");

-- CreateIndex
CREATE INDEX "shipment_items_variantId_idx" ON "shipment_items"("variantId");

-- CreateIndex
CREATE INDEX "shipment_events_shipmentId_idx" ON "shipment_events"("shipmentId");

-- CreateIndex
CREATE INDEX "shipment_events_status_idx" ON "shipment_events"("status");

-- CreateIndex
CREATE INDEX "shipment_events_createdAt_idx" ON "shipment_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "carriers_code_key" ON "carriers"("code");

-- CreateIndex
CREATE INDEX "carriers_status_idx" ON "carriers"("status");

-- CreateIndex
CREATE INDEX "carriers_code_idx" ON "carriers"("code");

-- CreateIndex
CREATE INDEX "fulfillment_queue_orderId_idx" ON "fulfillment_queue"("orderId");

-- CreateIndex
CREATE INDEX "fulfillment_queue_shipmentId_idx" ON "fulfillment_queue"("shipmentId");

-- CreateIndex
CREATE INDEX "fulfillment_queue_status_idx" ON "fulfillment_queue"("status");

-- CreateIndex
CREATE INDEX "fulfillment_queue_assignedTo_idx" ON "fulfillment_queue"("assignedTo");

-- CreateIndex
CREATE INDEX "pick_list_items_fulfillmentQueueId_idx" ON "pick_list_items"("fulfillmentQueueId");

-- CreateIndex
CREATE INDEX "pick_list_items_variantId_idx" ON "pick_list_items"("variantId");

-- CreateIndex
CREATE INDEX "shipping_labels_shipmentId_idx" ON "shipping_labels"("shipmentId");

-- CreateIndex
CREATE INDEX "shipping_exceptions_shipmentId_idx" ON "shipping_exceptions"("shipmentId");

-- CreateIndex
CREATE INDEX "shipping_exceptions_resolved_idx" ON "shipping_exceptions"("resolved");

-- CreateIndex
CREATE INDEX "delivery_confirmations_shipmentId_idx" ON "delivery_confirmations"("shipmentId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "refunds_orderId_idx" ON "refunds"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_idempotencyKey_key" ON "refunds"("idempotencyKey");

-- CreateIndex
CREATE INDEX "return_requests_orderId_idx" ON "return_requests"("orderId");

-- CreateIndex
CREATE INDEX "return_requests_profileId_idx" ON "return_requests"("profileId");

-- CreateIndex
CREATE INDEX "return_requests_shopId_idx" ON "return_requests"("shopId");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

-- CreateIndex
CREATE INDEX "return_requests_requestedAt_idx" ON "return_requests"("requestedAt");

-- CreateIndex
CREATE INDEX "return_items_returnRequestId_idx" ON "return_items"("returnRequestId");

-- CreateIndex
CREATE INDEX "return_items_orderItemId_idx" ON "return_items"("orderItemId");

-- CreateIndex
CREATE INDEX "return_items_variantId_idx" ON "return_items"("variantId");

-- CreateIndex
CREATE INDEX "return_status_history_returnRequestId_idx" ON "return_status_history"("returnRequestId");

-- CreateIndex
CREATE INDEX "return_status_history_createdAt_idx" ON "return_status_history"("createdAt");

-- CreateIndex
CREATE INDEX "return_refunds_returnRequestId_idx" ON "return_refunds"("returnRequestId");

-- CreateIndex
CREATE INDEX "return_refunds_paymentId_idx" ON "return_refunds"("paymentId");

-- CreateIndex
CREATE INDEX "return_refunds_orderId_idx" ON "return_refunds"("orderId");

-- CreateIndex
CREATE INDEX "return_refunds_status_idx" ON "return_refunds"("status");

-- CreateIndex
CREATE INDEX "inspections_returnRequestId_idx" ON "inspections"("returnRequestId");

-- CreateIndex
CREATE INDEX "inspections_returnItemId_idx" ON "inspections"("returnItemId");

-- CreateIndex
CREATE INDEX "inspections_inspectedAt_idx" ON "inspections"("inspectedAt");

-- CreateIndex
CREATE INDEX "reverse_logistics_returnRequestId_idx" ON "reverse_logistics"("returnRequestId");

-- CreateIndex
CREATE INDEX "reverse_logistics_status_idx" ON "reverse_logistics"("status");

-- CreateIndex
CREATE INDEX "reverse_logistics_trackingNumber_idx" ON "reverse_logistics"("trackingNumber");

-- CreateIndex
CREATE INDEX "disputes_returnRequestId_idx" ON "disputes"("returnRequestId");

-- CreateIndex
CREATE INDEX "disputes_orderId_idx" ON "disputes"("orderId");

-- CreateIndex
CREATE INDEX "disputes_profileId_idx" ON "disputes"("profileId");

-- CreateIndex
CREATE INDEX "disputes_shopId_idx" ON "disputes"("shopId");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "dispute_messages_disputeId_idx" ON "dispute_messages"("disputeId");

-- CreateIndex
CREATE INDEX "dispute_messages_createdAt_idx" ON "dispute_messages"("createdAt");

-- CreateIndex
CREATE INDEX "return_policies_shopId_idx" ON "return_policies"("shopId");

-- CreateIndex
CREATE INDEX "return_policies_isActive_idx" ON "return_policies"("isActive");

-- CreateIndex
CREATE INDEX "return_policies_effectiveFrom_effectiveUntil_idx" ON "return_policies"("effectiveFrom", "effectiveUntil");

-- CreateIndex
CREATE INDEX "timeline_events_orderId_idx" ON "timeline_events"("orderId");

-- CreateIndex
CREATE INDEX "timeline_events_type_idx" ON "timeline_events"("type");

-- CreateIndex
CREATE INDEX "timeline_events_occurredAt_idx" ON "timeline_events"("occurredAt");

-- CreateIndex
CREATE INDEX "timeline_events_customerVisible_idx" ON "timeline_events"("customerVisible");

-- CreateIndex
CREATE INDEX "timeline_events_orderId_occurredAt_idx" ON "timeline_events"("orderId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_status_idx" ON "warehouses"("status");

-- CreateIndex
CREATE INDEX "warehouses_priority_idx" ON "warehouses"("priority");

-- CreateIndex
CREATE INDEX "stock_movements_variantId_idx" ON "stock_movements"("variantId");

-- CreateIndex
CREATE INDEX "stock_movements_warehouseId_idx" ON "stock_movements"("warehouseId");

-- CreateIndex
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

-- CreateIndex
CREATE INDEX "stock_movements_variantId_createdAt_idx" ON "stock_movements"("variantId", "createdAt");

-- CreateIndex
CREATE INDEX "stock_reservations_variantId_status_idx" ON "stock_reservations"("variantId", "status");

-- CreateIndex
CREATE INDEX "stock_reservations_warehouseId_status_idx" ON "stock_reservations"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "stock_reservations_orderId_idx" ON "stock_reservations"("orderId");

-- CreateIndex
CREATE INDEX "stock_reservations_cartId_idx" ON "stock_reservations"("cartId");

-- CreateIndex
CREATE INDEX "stock_reservations_expiresAt_idx" ON "stock_reservations"("expiresAt");

-- CreateIndex
CREATE INDEX "stock_reservations_status_expiresAt_idx" ON "stock_reservations"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "stock_reservations_expiresAt_status_idx" ON "stock_reservations"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "low_stock_alerts_variantId_idx" ON "low_stock_alerts"("variantId");

-- CreateIndex
CREATE INDEX "low_stock_alerts_isAcknowledged_idx" ON "low_stock_alerts"("isAcknowledged");

-- CreateIndex
CREATE INDEX "low_stock_alerts_createdAt_idx" ON "low_stock_alerts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_settings_shopId_key" ON "inventory_settings"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_validUntil_idx" ON "coupons"("validUntil");

-- CreateIndex
CREATE INDEX "notifications_userId_status_idx" ON "notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "search_documents_name_idx" ON "search_documents"("name");

-- CreateIndex
CREATE INDEX "search_documents_categoryName_idx" ON "search_documents"("categoryName");

-- CreateIndex
CREATE INDEX "search_documents_brand_idx" ON "search_documents"("brand");

-- CreateIndex
CREATE INDEX "search_documents_price_idx" ON "search_documents"("price");

-- CreateIndex
CREATE INDEX "search_documents_rating_idx" ON "search_documents"("rating");

-- CreateIndex
CREATE INDEX "search_documents_stockStatus_idx" ON "search_documents"("stockStatus");

-- CreateIndex
CREATE INDEX "search_documents_popularityScore_idx" ON "search_documents"("popularityScore");

-- CreateIndex
CREATE INDEX "search_documents_recencyScore_idx" ON "search_documents"("recencyScore");

-- CreateIndex
CREATE UNIQUE INDEX "search_documents_productId_key" ON "search_documents"("productId");

-- CreateIndex
CREATE INDEX "search_history_userId_idx" ON "search_history"("userId");

-- CreateIndex
CREATE INDEX "search_history_guestId_idx" ON "search_history"("guestId");

-- CreateIndex
CREATE INDEX "search_history_createdAt_idx" ON "search_history"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "trending_searches_query_key" ON "trending_searches"("query");

-- CreateIndex
CREATE INDEX "trending_searches_count_idx" ON "trending_searches"("count");

-- CreateIndex
CREATE INDEX "trending_searches_window_idx" ON "trending_searches"("window");

-- CreateIndex
CREATE UNIQUE INDEX "shops_ownerId_key" ON "shops"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE INDEX "shops_status_idx" ON "shops"("status");

-- CreateIndex
CREATE INDEX "payout_accounts_shopId_idx" ON "payout_accounts"("shopId");

-- CreateIndex
CREATE INDEX "payment_transactions_paymentId_idx" ON "payment_transactions"("paymentId");

-- CreateIndex
CREATE INDEX "payment_transactions_gatewayReference_idx" ON "payment_transactions"("gatewayReference");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_idempotencyKey_key" ON "payment_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "webhook_events_status_idx" ON "webhook_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_eventId_key" ON "webhook_events"("provider", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_records_recordNumber_key" ON "finance_records"("recordNumber");

-- CreateIndex
CREATE INDEX "finance_records_orderId_idx" ON "finance_records"("orderId");

-- CreateIndex
CREATE INDEX "finance_records_referenceType_referenceId_idx" ON "finance_records"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "ledger_entries_financeRecordId_idx" ON "ledger_entries"("financeRecordId");

-- CreateIndex
CREATE INDEX "ledger_entries_account_idx" ON "ledger_entries"("account");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_settlementNumber_key" ON "settlements"("settlementNumber");

-- CreateIndex
CREATE INDEX "settlements_status_idx" ON "settlements"("status");

-- CreateIndex
CREATE INDEX "settlements_shopId_idx" ON "settlements"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_shopId_periodStart_periodEnd_key" ON "settlements"("shopId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "settlement_items_orderId_idx" ON "settlement_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_items_settlementId_orderId_key" ON "settlement_items"("settlementId", "orderId");

-- CreateIndex
CREATE INDEX "commission_rates_scope_shopId_effectiveFrom_idx" ON "commission_rates"("scope", "shopId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "payouts_shopId_status_idx" ON "payouts"("shopId", "status");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cod_orders_orderId_key" ON "cod_orders"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_payment_methods_providerTokenHash_key" ON "saved_payment_methods"("providerTokenHash");

-- CreateIndex
CREATE INDEX "saved_payment_methods_userId_idx" ON "saved_payment_methods"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_preferences_userId_key" ON "customer_preferences"("userId");

-- CreateIndex
CREATE INDEX "customer_preferences_userId_idx" ON "customer_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_userId_viewedAt_idx" ON "recently_viewed"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_userId_productId_key" ON "recently_viewed"("userId", "productId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_status_history" ADD CONSTRAINT "return_status_history_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_refunds" ADD CONSTRAINT "return_refunds_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_returnItemId_fkey" FOREIGN KEY ("returnItemId") REFERENCES "return_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_logistics" ADD CONSTRAINT "reverse_logistics_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_accounts" ADD CONSTRAINT "payout_accounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_records" ADD CONSTRAINT "finance_records_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_financeRecordId_fkey" FOREIGN KEY ("financeRecordId") REFERENCES "finance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_items" ADD CONSTRAINT "settlement_items_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_items" ADD CONSTRAINT "settlement_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rates" ADD CONSTRAINT "commission_rates_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rates" ADD CONSTRAINT "commission_rates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payoutAccountId_fkey" FOREIGN KEY ("payoutAccountId") REFERENCES "payout_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_orders" ADD CONSTRAINT "cod_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_payment_methods" ADD CONSTRAINT "saved_payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraints (Data Integrity)
-- Product: base price must be non-negative
ALTER TABLE "products" ADD CONSTRAINT "products_base_price_check" CHECK ("basePrice" >= 0);

-- ProductVariant: stock constraints
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_available_stock_check" CHECK ("availableStock" >= 0);
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_reserved_stock_check" CHECK ("reservedStock" >= 0);
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_reserved_stock_available_check" CHECK ("reservedStock" <= "availableStock");
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_price_check" CHECK ("price" >= 0);

-- CartItem: price and quantity constraints
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_unit_price_check" CHECK ("unitPrice" >= 0);
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_check" CHECK ("quantity" > 0);
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_line_total_check" CHECK ("lineTotal" >= 0);

-- ShippingRate: rate constraints
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_base_rate_check" CHECK ("baseRate" >= 0);
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_rate_per_kg_check" CHECK ("ratePerKg" >= 0);
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_free_above_amount_check" CHECK ("freeAboveAmount" >= 0);

-- Order: monetary field constraints
ALTER TABLE "orders" ADD CONSTRAINT "orders_items_subtotal_check" CHECK ("itemsSubtotal" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_total_check" CHECK ("shippingTotal" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_total_check" CHECK ("discountTotal" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_tax_total_check" CHECK ("taxTotal" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_grand_total_check" CHECK ("grandTotal" >= 0);

-- OrderItem: price and quantity constraints
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_unit_price_check" CHECK ("unitPrice" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_check" CHECK ("quantity" > 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_line_total_check" CHECK ("lineTotal" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_discount_total_check" CHECK ("discountTotal" >= 0);

-- Payment: amount constraint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_check" CHECK ("amount" >= 0);

-- Refund: amount constraint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_amount_check" CHECK ("amount" >= 0);

-- Coupon: value constraints
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_value_check" CHECK ("value" >= 0);
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_max_discount_check" CHECK ("maxDiscount" >= 0);
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_min_order_amount_check" CHECK ("minOrderAmount" >= 0);

-- FinanceRecord: amount constraint
ALTER TABLE "finance_records" ADD CONSTRAINT "finance_records_amount_check" CHECK ("amount" >= 0);

-- Settlement: monetary field constraints
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_gross_amount_check" CHECK ("grossAmount" >= 0);
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_commission_amount_check" CHECK ("commissionAmount" >= 0);
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_refund_adjustment_check" CHECK ("refundAdjustment" >= 0);
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_net_amount_check" CHECK ("netAmount" >= 0);

-- Payout: amount constraint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_amount_check" CHECK ("amount" >= 0);

