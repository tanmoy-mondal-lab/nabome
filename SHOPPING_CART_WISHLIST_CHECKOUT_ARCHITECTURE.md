# নবME (Nabome) — Shopping Cart, Wishlist & Checkout Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for the complete purchase experience  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), ENGINEERING_HANDBOOK.md (v1.0), CUSTOMER_EXPERIENCE_ARCHITECTURE.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0), VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Shopping Cart Architecture](#2-shopping-cart-architecture)
3. [Wishlist Architecture](#3-wishlist-architecture)
4. [Checkout Architecture](#4-checkout-architecture)
5. [Order Validation Architecture](#5-order-validation-architecture)
6. [Promotions Architecture](#6-promotions-architecture)
7. [Responsive UX Architecture](#7-responsive-ux-architecture)
8. [Error Handling Architecture](#8-error-handling-architecture)
9. [Performance Architecture](#9-performance-architecture)
10. [Accessibility Architecture](#10-accessibility-architecture)
11. [Security Architecture](#11-security-architecture)
12. [Future Readiness Architecture](#12-future-readiness-architecture)
13. [Mandatory Rules for AI Agents](#13-mandatory-rules-for-ai-agents)

---

## 1. Architecture Philosophy

### 1.1 What

The foundational principles governing the Shopping Cart, Wishlist, Checkout, and Purchase Flow for the Nabome platform.

### 1.2 Why

- **Revenue:** Cart and checkout are the final steps before revenue — any friction loses money.
- **Trust:** Customers must feel confident at every step of purchase.
- **Efficiency:** Minimum clicks from intent to confirmation.
- **Consistency:** Same patterns for every product, every customer, every device.
- **Scale:** Architecture supports 0 to 1M+ concurrent checkouts.

### 1.3 Where

Every interaction between product discovery and order confirmation — cart page, mini cart, wishlist, checkout flow, payment, order confirmation.

### 1.4 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Zero-friction purchase** | Every unnecessary step is removed | Conversion |
| **Mobile-first checkout** | Designed for thumb, enhanced for desktop | 70%+ mobile traffic |
| **Premium confidence** | Every step feels secure and trustworthy | Brand perception |
| **Transparent pricing** | All costs visible before payment commitment | Trust |
| **Guest-first** | Purchase possible without registration | Zero friction |
| **Real-time validation** | Stock, price, coupon validated instantly | Accuracy |
| **Optimistic UX** | Show expected result immediately | Perceived speed |
| **Minimal cognitive load** | One decision per screen | Simplicity |
| **Undo-friendly** | Every action reversible where possible | Confidence |
| **Enterprise-grade security** | Every request validated, authenticated, authorized | Protection |

### 1.5 Experience Promise

```
┌─────────────────────────────────────────────────────────────────┐
│                    PURCHASE EXPERIENCE PROMISE                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Customers experience:                                    │   │
│  │  • Effortless add-to-cart with instant feedback           │   │
│  │  • Clear cart with transparent pricing                    │   │
│  │  • Minimal-step checkout (3 screens or less)              │   │
│  │  • Secure, confidence-building payment                    │   │
│  │  • Instant order confirmation with next steps             │   │
│  │  • Ability to save items for later (wishlist)             │   │
│  │  • Seamless device-switching (cart syncs)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Customers never experience:                              │   │
│  │  • Lost cart items between sessions                       │   │
│  │  • Surprise costs at checkout                             │   │
│  │  • Out-of-stock items in cart                             │   │
│  │  • Forced registration before purchase                    │   │
│  │  • Confusing multi-page checkout                          │   │
│  │  • Uncertain payment status                               │   │
│  │  • Lost wishlist between devices                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Cart only in localStorage | Lost on device switch | Server-side cart with guest fallback |
| Forced registration before checkout | Friction, abandonment | Guest checkout with optional account creation |
| Hidden shipping costs | Trust erosion | Show shipping estimate before checkout |
| No stock validation at checkout | Overselling, disappointment | Real-time stock check at every step |
| Cart clearing on error | Frustration, data loss | Preserve cart state through errors |
| Multi-page checkout with redirects | Confusion, abandonment | Single-page checkout with sections |
| No undo for remove actions | Accidental loss | Undo toast, not confirmation dialog |
| Synchronous stock reservation | Slow checkout | Optimistic UI with background reservation |
| No cart recovery | Lost revenue | Abandoned cart email within 1 hour |
| Coupon code only in cart | Missed discounts | Coupon available in cart AND checkout |

---

## 2. Shopping Cart Architecture

### 2.1 What

The complete architecture for adding, removing, updating, persisting, synchronizing, and recovering shopping cart items — from the first "Add to Cart" tap to checkout entry.

### 2.2 Why

- **Revenue:** Cart is the bridge between browsing and buying.
- **Retention:** Saved carts bring customers back.
- **Trust:** Cart must never lose items unexpectedly.
- **Conversion:** Smooth cart experience drives checkout completion.

### 2.3 Where

Product detail page (add to cart), mini cart (quick view), cart page (full management), header (cart badge), checkout entry, API handlers (`api/_handlers/cart/`), frontend feature (`src/features/cart/`).

### 2.4 Cart Philosophy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Source of truth** | Database (PostgreSQL) | Persistent, syncable across devices |
| **Client cache** | TanStack Query | Optimistic updates, background sync |
| **Guest support** | localStorage + server merge on login | Zero friction |
| **Persistence** | 90 days for guest, indefinite for customer | Don't lose work |
| **Merge strategy** | Guest cart items added to customer cart on login | Continuity |
| **Max items** | 50 unique items per cart | Prevent abuse |
| **Max quantity** | 10 per item (or stock limit) | Business rule |

### 2.5 Cart Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    CART LIFECYCLE                                 │
│                                                                  │
│  1. EMPTY CART                                                   │
│     → Customer has no items                                      │
│     → Display: "Your cart is empty" + CTA to shop               │
│                                                                  │
│  2. ITEM ADDED                                                   │
│     → Customer taps "Add to Cart" on product detail             │
│     → Variant required (or auto-selected if single)             │
│     → Quantity defaults to 1                                     │
│     → Toast: "Added to cart" + View Cart link                   │
│     → Cart badge updates (header)                               │
│     → Mini cart opens (desktop) or slides up (mobile)           │
│                                                                  │
│  3. ITEM UPDATED                                                 │
│     → Customer changes quantity via +/- controls                │
│     → Real-time stock validation                                │
│     → Price updates immediately                                 │
│     → Subtotal recalculates                                     │
│                                                                  │
│  4. ITEM REMOVED                                                 │
│     → Swipe on mobile, button on desktop                        │
│     → Toast with "Undo" option (5 seconds)                     │
│     → Cart recalculates                                         │
│                                                                  │
│  5. VARIANT CHANGED                                              │
│     → Customer changes size/color on cart item                  │
│     → Stock validated for new variant                            │
│     → Price updated if different                                │
│     → No duplicate items (merge if same variant)                │
│                                                                  │
│  6. MOVE TO WISHLIST                                             │
│     → "Save for later" moves item to wishlist                  │
│     → Item removed from cart                                    │
│     → Toast confirmation                                         │
│                                                                  │
│  7. CART VALIDATION (pre-checkout)                               │
│     → Stock availability checked                                │
│     → Price changes detected                                    │
│     → Inactive items flagged                                    │
│     → Shipping restrictions checked                             │
│                                                                  │
│  8. CHECKOUT ENTRY                                               │
│     → Cart validated, items reserved                            │
│     → Transition to checkout flow                               │
│                                                                  │
│  9. ABANDONMENT RECOVERY                                         │
│     → 1 hour: Email reminder (if email captured)               │
│     → 24 hours: "Items still in your cart" email               │
│     → 72 hours: Final reminder + optional incentive            │
│     → 7 days: Cart expires (guest) or remains (customer)       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Guest Cart

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Identification** | Generate UUID on first add-to-cart | Unique guest |
| **Storage** | Server-side with guest token in httpOnly cookie | Persistent |
| **Duration** | 90 days from last activity | Reasonable retention |
| **Merge on login** | Guest items added to customer cart | Continuity |
| **Duplicate handling** | Merge quantities for same variant | No duplicates |
| **Checkout** | Guest checkout available | Zero friction |
| **Email capture** | Capture email at checkout for recovery | Retention |

### 2.7 Customer Cart

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Identification** | Linked to customer profile ID | Persistent identity |
| **Storage** | Database (cart + cartItems tables) | Source of truth |
| **Duration** | Indefinite (until checkout or manual clear) | Don't lose work |
| **Multi-device** | Same cart on all devices | Continuity |
| **Cart badge** | Shows item count on all devices | Consistent info |

### 2.8 Cart Persistence

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Guest** | Server-side with guest token cookie | Survives browser close |
| **Customer** | Database linked to profile | Survives any device |
| **Offline** | localStorage fallback for add-to-cart | Graceful degradation |
| **Sync** | On login, merge localStorage → server | No data loss |
| **TTL** | 90 days guest, indefinite customer | Reasonable retention |

### 2.9 Cart Synchronization

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| **Same device, same session** | Real-time via TanStack Query | Instant |
| **Same device, new session** | Fetch from server on load | Persistent |
| **Different device, logged in** | Same server cart, different views | Consistent |
| **Guest → Customer login** | Merge guest cart into customer cart | Continuity |
| **Multiple tabs** | BroadcastChannel API for cross-tab sync | Consistent |
| **Conflict (same item, different qty)** | Take higher quantity | Customer intent |

### 2.10 Cart Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Guest** | Owned by anonymous token | Session-based |
| **Customer** | Owned by profile ID | Account-based |
| **Transfer** | Guest → Customer on login | Continuity |
| **Admin visibility** | No admin access to customer carts | Privacy |
| **Data isolation** | RLS ensures cart isolation | Security |

### 2.11 Cart Recovery

| Timing | Action | Channel | Content |
|--------|--------|---------|---------|
| **1 hour** | First reminder | Email | "You left items in your cart" |
| **24 hours** | Second reminder | Email | "Your items are waiting" |
| **72 hours** | Final reminder | Email | "Last chance + 5% off" |
| **7 days** | Cart expires (guest) | — | Cleanup |
| **7 days** | Cart remains (customer) | — | Available on return |

**Recovery Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Email required** | Capture email at checkout entry | Enable recovery |
| **Opt-out** | Unsubscribe link in every email | Compliance |
| **Personalization** | Include product images in email | Engagement |
| **Deep link** | Link directly to cart with items | Convenience |
| **Incentive** | Optional discount in final reminder | Conversion |
| **Frequency cap** | Max 3 recovery emails per cart | Don't spam |

### 2.12 Multiple Device Behavior

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| **Add on mobile, view on desktop** | Same cart visible | Consistency |
| **Add on desktop, checkout on mobile** | Same cart, same items | Continuity |
| **Simultaneous edits** | Last-write-wins per item | Simple conflict resolution |
| **Stock changes between devices** | Revalidate on checkout entry | Accuracy |
| **Price changes between devices** | Show updated price on next load | Transparency |

### 2.13 Add to Cart Architecture

**Trigger Points:**

| Trigger | Location | Behavior |
|---------|----------|----------|
| **Product detail "Add to Cart"** | Primary CTA | Add selected variant + quantity |
| **Product card "Quick Add"** | Desktop hover overlay | Add default variant |
| **Mini cart "+"** | Mini cart item | Increment quantity |
| **"Buy Now"** | Secondary CTA on product detail | Add to cart + redirect to checkout |
| **Reorder** | Order history "Buy again" | Add all items from previous order |

**Add to Cart Flow:**

```
1. Customer taps "Add to Cart"
   → Button shows loading spinner
   → Disable button (prevent double-submit)

2. Validate variant selection
   → If no variant selected: scroll to variant selector
   → If variant selected: proceed

3. Validate stock
   → If in stock: proceed
   → If low stock: add + show "Only X left" warning
   → If out of stock: show error, don't add

4. Add to cart (API call)
   → POST /api/cart/add
   → { variantId, quantity }

5. Server response
   → Success: update cart cache, show toast
   → Duplicate variant: merge quantities
   → Stock exceeded: add available quantity, warn

6. UI feedback
   → Toast: "Added to cart" + item count
   → Cart badge updates
   → Mini cart opens (desktop) or slides up (mobile)
   → Re-enable button
```

**Add to Cart Validation Schema:**

```typescript
// Zod schema for add-to-cart
const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});
```

### 2.14 Remove from Cart Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Mobile** | Swipe left to reveal "Remove" | Natural gesture |
| **Desktop** | "Remove" text button or X icon | Clear action |
| **Feedback** | Undo toast (5 seconds) | Reversible |
| **No confirmation** | Remove immediately | Speed |
| **API call** | DELETE /api/cart/items/:itemId | Clean REST |
| **Cart recalculation** | Subtotal updates immediately | Transparency |

### 2.15 Update Quantity Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Controls** | [-] quantity [+] buttons | Familiar pattern |
| **Min** | 1 (cannot go below) | Business rule |
| **Max** | Min(stock, 10) | Stock + business rule |
| **Input** | Tap number to type (mobile) | Power users |
| **Debounce** | 500ms after last change | Prevent rapid API calls |
| **Validation** | Real-time stock check on increase | Accuracy |
| **Feedback** | Price updates immediately | Transparency |

### 2.16 Change Variant Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Tap variant text on cart item | Discoverable |
| **Interface** | Bottom sheet (mobile) / modal (desktop) | Focused |
| **Options** | Show available variants for product | Complete |
| **Stock** | Disabled if out of stock | Honest |
| **Duplicate** | If new variant exists in cart, merge quantities | No duplicates |
| **Price** | Update if price differs | Accuracy |

### 2.17 Move to Wishlist Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | "Save for later" button on cart item | Clear intent |
| **Action** | Remove from cart, add to wishlist | Transfer |
| **Feedback** | Toast: "Moved to wishlist" | Confirmation |
| **Undo** | Undo option in toast (5 seconds) | Reversible |
| **API** | Two calls: remove from cart + add to wishlist | Atomic feel |
| **Stock** | Release reserved stock | Inventory management |

### 2.18 Save for Later Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Definition** | Synonym for "Move to Wishlist" | Consistent terminology |
| **Placement** | Below cart items, above subtotal | Discoverable |
| **Count** | Show "X items saved for later" | Context |
| **Quick move back** | "Move to Cart" on saved items | Easy reversal |

### 2.19 Buy Now Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Placement** | Secondary button on product detail page | Alternative to cart |
| **Behavior** | Add to cart → Redirect to checkout | Speed |
| **Single item** | Only one product per "Buy Now" | Simplified |
| **Variant required** | Must select variant first | Accuracy |
| **Stock check** | Validate before redirect | Accuracy |
| **Feedback** | Brief loading state | Confirmation |

### 2.20 Continue Shopping Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Placement** | Below checkout CTA on cart page | Alternative path |
| **Behavior** | Returns to last viewed category/shop page | Continuity |
| **Default** | `/shop` if no browsing history | Fallback |
| **Cart preserved** | Cart maintained while browsing | Don't lose work |
| **Toast** | "Item saved in cart" on navigation | Reassurance |

### 2.21 Cart Merge Architecture

| Scenario | Strategy | Rationale |
|----------|----------|-----------|
| **Guest → Login** | Add guest items to customer cart | Continuity |
| **Duplicate item** | Sum quantities (max stock) | No duplicates |
| **Out of stock item** | Skip, notify customer | Accuracy |
| **Price changed** | Use current price | Transparency |
| **Inactive variant** | Skip, notify customer | Honesty |

### 2.22 Cart Validation Architecture

| Validation | Timing | Response |
|-----------|--------|----------|
| **Stock availability** | On checkout entry + on quantity change | "Only X available" |
| **Price changes** | On cart load | "Price updated to ₹X" |
| **Variant availability** | On cart load | "Variant no longer available" |
| **Minimum order** | On checkout entry | "Minimum order is ₹X" |
| **Shipping restrictions** | On address entry | "Cannot ship to this address" |
| **Coupon validity** | On coupon apply + on checkout | "Coupon expired" or "Minimum not met" |

### 2.23 Bulk Actions Architecture

| Action | Trigger | Behavior |
|--------|---------|----------|
| **Clear cart** | "Clear cart" button | Remove all items, confirm |
| **Remove out-of-stock** | "Remove unavailable" link | Remove items with stock ≤ 0 |
| **Select all** | Checkbox in cart header | Select for bulk remove |
| **Bulk remove** | "Remove selected" button | Remove selected items |

### 2.24 Cart API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/cart` | GET | Get cart with items | Optional (guest token) |
| `/api/cart/add` | POST | Add item to cart | Optional (guest token) |
| `/api/cart/items/:id` | PATCH | Update quantity/variant | Optional (guest token) |
| `/api/cart/items/:id` | DELETE | Remove item | Optional (guest token) |
| `/api/cart/sync` | POST | Merge guest → customer cart | Required (customer) |
| `/api/cart/validate` | POST | Validate cart for checkout | Optional (guest token) |
| `/api/cart/clear` | DELETE | Clear all items | Optional (guest token) |

### 2.25 Cart Zod Schemas

```typescript
const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10).optional(),
  variantId: z.string().uuid().optional(),
});

const validateCartSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })),
});
```

---

## 3. Wishlist Architecture

### 3.1 What

The complete architecture for saving, managing, sharing, and recovering wishlisted items — independent from the cart module.

### 3.2 Why

- **Retention:** Wishlist brings customers back to purchase later.
- **Discovery:** Wishlist reveals customer preferences.
- **Revenue:** Price drop and back-in-stock notifications drive sales.
- **Social:** Shareable wishlists enable gifting and social proof.

### 3.3 Where

Product detail page (heart icon), product card (heart icon), wishlist page (`/account/wishlist`), account navigation, API handlers (`api/_handlers/wishlist/`), frontend feature (`src/features/wishlist/`).

### 3.4 Wishlist Philosophy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Independence** | Wishlist is a separate module from cart | Clean separation |
| **Server-side** | Database-backed, not localStorage | Persistent across devices |
| **Guest support** | localStorage for guests, prompt to save | Zero friction |
| **No limit** | No artificial maximum items | Freedom |
| **Duplicate prevention** | Same variant cannot be wishlisted twice | Clean data |
| **Price tracking** | Track price changes on wishlisted items | Value |
| **Stock tracking** | Notify when out-of-stock items return | Recovery |

### 3.5 Wishlist Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    WISHLIST LIFECYCLE                             │
│                                                                  │
│  1. EMPTY WISHLIST                                               │
│     → Customer has no saved items                                │
│     → Display: "Your wishlist is empty" + CTA to browse         │
│                                                                  │
│  2. ITEM ADDED                                                   │
│     → Customer taps heart icon on product card or detail        │
│     → Heart fills with brand color                              │
│     → Toast: "Added to wishlist"                                │
│     → Wishlist badge updates (if visible)                        │
│                                                                  │
│  3. ITEM VIEWED                                                  │
│     → Customer visits wishlist page                              │
│     → Items displayed with current prices                       │
│     → Price changes highlighted                                 │
│     → Stock status shown                                        │
│                                                                  │
│  4. ITEM MOVED TO CART                                           │
│     → Customer taps "Add to Cart" on wishlist item             │
│     → Item removed from wishlist                                │
│     → Added to cart                                             │
│     → Toast: "Moved to cart"                                    │
│                                                                  │
│  5. ITEM REMOVED                                                 │
│     → Customer taps heart again or "Remove" button             │
│     → Heart outline returns                                     │
│     → Toast: "Removed from wishlist"                            │
│     → No confirmation needed                                    │
│                                                                  │
│  6. PRICE DROP DETECTED                                          │
│     → System detects price decrease                              │
│     → Badge on wishlist item: "Price dropped"                   │
│     → Email notification (if opted in)                           │
│                                                                  │
│  7. BACK IN STOCK                                                │
│     → System detects restock                                     │
│     → Badge on wishlist item: "Back in stock"                   │
│     → Email notification (if opted in)                           │
│                                                                  │
│  8. ITEM DEACTIVATED                                             │
│     → Product removed from catalog                               │
│     → Wishlist shows "No longer available"                       │
│     → Remove option provided                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Guest Wishlist

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Storage** | localStorage | No account required |
| **Max items** | 50 | Prevent abuse |
| **Sync** | Prompt to login to save permanently | Conversion |
| **Merge** | On login, merge localStorage wishlist into server | Continuity |
| **Duration** | Until browser data cleared | Session-based |

### 3.7 Customer Wishlist

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Storage** | Database (wishlist table) | Persistent |
| **Linked to** | Profile ID | Account-based |
| **Multi-device** | Same wishlist on all devices | Consistency |
| **Price tracking** | Compare stored price vs current | Value |
| **Stock tracking** | Check availability on load | Relevance |

### 3.8 Wishlist Synchronization

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| **Same device** | Real-time via TanStack Query | Instant |
| **Different device** | Same server wishlist | Consistency |
| **Guest → Login** | Merge localStorage into server | Continuity |
| **Conflict** | Deduplicate by variant ID | No duplicates |

### 3.9 Wishlist Sharing Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Share link** | Generate unique URL per wishlist | Social |
| **Visibility** | Public link shows item names + images | Discovery |
| **Privacy** | No personal info in shared link | Security |
| **CTA** | "Add to Cart" on shared items | Conversion |
| **Future** | Gift registry integration | Expansion |

### 3.10 Wishlist Recovery

| Trigger | Action | Channel |
|---------|--------|---------|
| **Price drop** | Notify customer | Email (opt-in) |
| **Back in stock** | Notify customer | Email (opt-in) |
| **Abandoned wishlist** | "You have X items saved" | Email (weekly digest) |
| **Sale event** | "Sale on your wishlist items" | Email (opt-in) |

### 3.11 Add to Wishlist Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Heart icon on product card or detail | Discoverable |
| **Icon state** | Outline (empty) / Filled (saved) | Visual state |
| **Animation** | Heart fill animation on add | Delightful |
| **Feedback** | Toast: "Added to wishlist" | Confirmation |
| **Guest** | Store in localStorage + prompt login | Zero friction |
| **Duplicate** | If already wishlisted, remove (toggle) | Simple |
| **API** | POST /api/wishlist/add | Clean REST |

### 3.12 Remove from Wishlist Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Heart icon (tap filled heart) | Toggle behavior |
| **On wishlist page** | "Remove" button or swipe | Multiple paths |
| **Feedback** | Toast: "Removed from wishlist" | Confirmation |
| **No confirmation** | Remove immediately | Speed |
| **API** | DELETE /api/wishlist/items/:itemId | Clean REST |

### 3.13 Move to Cart Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | "Add to Cart" button on wishlist item | Clear action |
| **Action** | Add to cart + remove from wishlist | Transfer |
| **Stock check** | Validate before move | Accuracy |
| **Feedback** | Toast: "Moved to cart" | Confirmation |
| **Out of stock** | Show "Out of stock" instead of button | Honest |
| **API** | POST /api/cart/add + DELETE /api/wishlist/items/:id | Two calls |

### 3.14 Bulk Add Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | "Add all to cart" button on wishlist page | Efficiency |
| **Stock validation** | Check all items before adding | Accuracy |
| **Partial success** | Add available items, skip unavailable | Transparency |
| **Feedback** | "X items added, Y unavailable" | Clear outcome |
| **API** | POST /api/wishlist/move-all-to-cart | Single call |

### 3.15 Bulk Remove Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | "Remove all" or multi-select + remove | Efficiency |
| **Confirmation** | "Remove X items from wishlist?" | Safety |
| **Feedback** | Toast: "X items removed" | Confirmation |
| **API** | DELETE /api/wishlist/clear | Single call |

### 3.16 Duplicate Prevention Architecture

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| **Same variant, same user** | Toggle (add if not exists, remove if exists) | Simple |
| **API validation** | Check variantId + profileId uniqueness | Data integrity |
| **Database constraint** | @@unique([profileId, variantId]) | DB-level protection |
| **Client-side check** | Optimistic check before API call | Speed |

### 3.17 Wishlist API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/wishlist` | GET | Get wishlist items | Optional (guest token) |
| `/api/wishlist/add` | POST | Add item to wishlist | Optional (guest token) |
| `/api/wishlist/items/:id` | DELETE | Remove item | Optional (guest token) |
| `/api/wishlist/move-to-cart/:id` | POST | Move item to cart | Optional (guest token) |
| `/api/wishlist/move-all-to-cart` | POST | Move all to cart | Required (customer) |
| `/api/wishlist/clear` | DELETE | Clear wishlist | Optional (guest token) |

### 3.18 Wishlist Zod Schemas

```typescript
const addToWishlistSchema = z.object({
  variantId: z.string().uuid(),
});

const moveToCartSchema = z.object({
  wishlistItemId: z.string().uuid(),
});
```

---

## 4. Checkout Architecture

### 4.1 What

The complete architecture for the checkout flow — from cart validation through address selection, shipping, coupon application, payment, and order confirmation.

### 4.2 Why

- **Revenue:** Checkout is where browsing becomes revenue.
- **Trust:** Every step must feel secure and transparent.
- **Speed:** Minimum steps from intent to confirmation.
- **Conversion:** Every friction point loses sales.

### 4.3 Where

Cart page (checkout entry), checkout page (`/checkout`), payment integration (Razorpay), order confirmation (`/order-confirmed/:id`), API handlers (`api/_handlers/checkout/`), frontend feature (`src/features/checkout/`).

### 4.4 Checkout Philosophy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Minimum steps** | 3 screens: Address → Shipping → Payment | Simplicity |
| **Single page** | All sections on one page, progressive disclosure | No navigation confusion |
| **Guest first** | Checkout available without account | Zero friction |
| **Transparent** | Order summary always visible | Trust |
| **Validated early** | Stock, price, coupon validated before payment | Accuracy |
| **Recoverable** | Abandoned checkout recoverable via email | Revenue recovery |
| **Mobile optimized** | Full-width, stacked, thumb-friendly | 70%+ mobile |

### 4.5 Checkout Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT STAGES                                │
│                                                                  │
│  STAGE 1: CART REVIEW                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Review items in cart                                   │   │
│  │  • Adjust quantities                                     │   │
│  │  • Apply coupon code                                     │   │
│  │  • See subtotal                                          │   │
│  │  • "Proceed to Checkout" CTA                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  STAGE 2: ADDRESS                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Select saved address (if logged in)                   │   │
│  │  • Add new address                                       │   │
│  │  • Guest: enter address                                  │   │
│  │  • Validate pincode for delivery                         │   │
│  │  • Auto-fill city/state from pincode                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  STAGE 3: SHIPPING                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Show available shipping methods                       │   │
│  │  • Display delivery estimates                            │   │
│  │  • Show shipping cost                                    │   │
│  │  • Free shipping progress bar                            │   │
│  │  • Select shipping method                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  STAGE 4: PAYMENT                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Order summary (always visible)                        │   │
│  │  • Subtotal + Discount + Shipping = Total                │   │
│  │  • "Inclusive of all taxes"                              │   │
│  │  • Payment method selection                              │   │
│  │  • "Place Order" CTA                                     │   │
│  │  • Razorpay payment modal                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  STAGE 5: CONFIRMATION                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Full-page confirmation                                │   │
│  │  • Order number (prominent, copyable)                    │   │
│  │  • "Order placed successfully!"                          │   │
│  │  • What happens next (timeline)                          │   │
│  │  • Email confirmation sent                               │   │
│  │  • "Continue Shopping" CTA                               │   │
│  │  • "Track Order" CTA                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Checkout Validation Architecture

| Validation | Timing | Response |
|-----------|--------|----------|
| **Cart not empty** | Checkout entry | Redirect to shop if empty |
| **Stock availability** | Checkout entry + before payment | "X is no longer available" |
| **Price changes** | Checkout entry + before payment | "Price updated to ₹X" |
| **Address valid** | Before shipping selection | "Please enter a valid address" |
| **Pincode serviceable** | On pincode entry | "We don't deliver to this pincode" |
| **Shipping selected** | Before payment | "Please select a shipping method" |
| **Coupon valid** | On apply + before payment | "Coupon expired" or "Minimum not met" |
| **Payment ready** | Before Razorpay modal | All validations passed |

### 4.7 Checkout Recovery Architecture

| Timing | Action | Channel |
|--------|--------|---------|
| **5 minutes** | Save checkout state | Server-side |
| **1 hour** | "Complete your order" email | Email |
| **24 hours** | "Your items are waiting" email | Email |
| **72 hours** | Final reminder + optional incentive | Email |
| **7 days** | Checkout expires, cart items remain | — |

### 4.8 Checkout Confirmation Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Order number** | NAB-YYYYMMDD-XXXXXX format | Human-readable |
| **Success message** | "Order placed successfully!" | Positive reinforcement |
| **Order summary** | Items + total + shipping address | Confirmation |
| **Next steps** | "You'll receive a confirmation email" | Reassurance |
| **Timeline** | "Estimated delivery: X-Y days" | Planning |
| **CTAs** | "Track Order" + "Continue Shopping" | Next actions |
| **Email** | Confirmation email sent immediately | Reassurance |
| **Cart cleared** | Cart emptied after successful order | Cleanup |

### 4.9 Address Selection Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Saved addresses** | Show as cards with radio select | Quick selection |
| **Default address** | Pre-selected, marked "Default" | Speed |
| **Add new** | "Add new address" button | Flexibility |
| **Edit** | Edit icon on each address card | Quick modification |
| **Delete** | Delete icon with confirmation | Safety |
| **Indian format** | Name, phone, address, city, state, pincode | Local |
| **Pincode lookup** | Auto-fill city/state from pincode | Speed |
| **Phone required** | For delivery contact | Logistics |
| **Validation** | All fields validated on save | Accuracy |

**Address Fields:**

```typescript
interface Address {
  id: string;
  name: string;           // Recipient name
  phone: string;          // Delivery contact
  line1: string;          // Address line 1
  line2?: string;         // Address line 2 (optional)
  city: string;           // City
  state: string;          // State
  pincode: string;        // 6-digit Indian pincode
  country: string;        // Default: "IN"
  isDefault: boolean;     // Default shipping address
}
```

### 4.10 Address Creation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | "Add new address" button | Clear action |
| **Interface** | Modal (desktop) / full-screen (mobile) | Focused |
| **Fields** | Name, phone, address, city, state, pincode | Indian format |
| **Pincode autocomplete** | Lookup city/state from pincode API | Speed |
| **Validation** | Real-time on blur | Immediate feedback |
| **Save** | "Save address" button | Explicit action |
| **Max addresses** | 10 per customer | Prevent abuse |

### 4.11 Shipping Selection Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Address required** | Show shipping options after address | Accuracy |
| **Methods** | Standard + Express at minimum | Choice |
| **Cost** | Display cost per method | Transparency |
| **Free shipping** | Highlight when threshold met | Incentive |
| **Delivery estimate** | "Delivered by X-Y [day]" | Planning |
| **Selection** | Radio buttons, one selected by default | Clear choice |
| **Default** | Standard shipping pre-selected | Safe default |

**Shipping Methods:**

| Method | Cost | Delivery Time | Use Case |
|--------|------|---------------|----------|
| **Standard** | Free over ₹999, else ₹99 | 5-7 business days | Default |
| **Express** | ₹199 | 2-3 business days | Urgent |
| **Same Day** | ₹299 | Same day (metro only) | Premium (future) |

### 4.12 Coupon Application Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Input field** | In cart AND checkout | Accessible |
| **Apply button** | Next to input | Clear action |
| **Validation** | Real-time on apply | Immediate feedback |
| **Success** | Show discount amount + new total | Reinforcement |
| **Error** | Specific message | Actionable |
| **Remove** | X button to remove applied coupon | Control |
| **One at a time** | Only one coupon per order | Business rule |
| **Minimum order** | Show minimum before apply | Expectation |

**Coupon Validation Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Exists** | Coupon code must exist | Accuracy |
| **Active** | Coupon must be active | Honesty |
| **Not expired** | Check expiry date | Transparency |
| **Minimum order** | Check cart subtotal meets minimum | Business rule |
| **Usage limit** | Check usage count < limit | Business rule |
| **User restriction** | Check if user-specific | Business rule |
| **Product restriction** | Check if applicable to cart items | Business rule |

### 4.13 Discount Calculation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISCOUNT CALCULATION                           │
│                                                                  │
│  1. SUBTOTAL                                                     │
│     → Sum of (item price × quantity) for all items              │
│                                                                  │
│  2. ITEM DISCOUNTS                                               │
│     → Sale price reductions (if item on sale)                   │
│     → Per-item savings displayed                                │
│                                                                  │
│  3. COUPON DISCOUNT                                              │
│     → Percentage or fixed amount                                │
│     → Applied to subtotal (after item discounts)                │
│     → Capped at subtotal (no negative total)                    │
│                                                                  │
│  4. SHIPPING COST                                                │
│     → Based on selected shipping method                         │
│     → Free if threshold met                                     │
│                                                                  │
│  5. TAX                                                          │
│     → GST included in displayed prices                          │
│     → "Inclusive of all taxes"                                  │
│                                                                  │
│  6. TOTAL                                                        │
│     → Subtotal - Coupon Discount + Shipping = Total             │
│     → Always ≥ ₹0                                               │
│                                                                  │
│  DISPLAY:                                                        │
│     Subtotal:          ₹2,999                                   │
│     Sale savings:     -₹500                                     │
│     Coupon (SAVE10):  -₹250                                     │
│     Shipping:           Free                                    │
│     ─────────────────────────                                   │
│     Total:            ₹2,249                                    │
│     "You save: ₹750"                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.14 Order Summary Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Always visible** | Summary shown on every checkout screen | Transparency |
| **Collapsible mobile** | Expand to see full details | Space efficiency |
| **Items list** | Image + name + variant + qty + price | Complete |
| **Subtotal** | Before discounts | Context |
| **Discounts** | Item discounts + coupon | Savings visibility |
| **Shipping** | Cost + method | Transparency |
| **Total** | Final amount, prominent | Decision factor |
| **"You save"** | Total savings highlighted | Reinforcement |
| **Tax note** | "Inclusive of all taxes" | Transparency |

### 4.15 Final Confirmation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Button text** | "Place Order — ₹X,XXX" | Clear action + amount |
| **Loading state** | Spinner + "Processing..." | Feedback |
| **Disabled during** | Button disabled during payment | Prevent double-submit |
| **Payment modal** | Razorpay modal opens | Secure payment |
| **Success** | Redirect to confirmation page | Clear completion |
| **Failure** | Show error + "Try Again" | Recovery |
| **Network error** | Retry automatically + show status | Resilience |

### 4.16 Payment Readiness Architecture

| Check | Standard | Rationale |
|-------|----------|-----------|
| **Cart validated** | All items in stock, prices correct | Accuracy |
| **Address valid** | Complete, valid pincode | Logistics |
| **Shipping selected** | Method chosen | Required |
| **Total > ₹0** | Cannot pay zero amount | Business rule |
| **Idempotency key** | Unique per checkout attempt | Prevent duplicates |

### 4.17 Order Placement Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER PLACEMENT FLOW                           │
│                                                                  │
│  1. Customer taps "Place Order"                                  │
│     → Button disabled, spinner shown                            │
│     → Prevent double-submit                                     │
│                                                                  │
│  2. Client validates checkout state                              │
│     → Address complete                                          │
│     → Shipping selected                                         │
│     → Cart not empty                                            │
│                                                                  │
│  3. Client calls create-order API                                │
│     → POST /api/checkout/create-order                           │
│     → Server validates everything again                         │
│     → Server creates Razorpay order                             │
│     → Server returns razorpayOrderId                            │
│                                                                  │
│  4. Razorpay modal opens                                        │
│     → Customer selects payment method                           │
│     → Customer completes payment                                │
│                                                                  │
│  5. Razorpay returns result                                      │
│     → Success: call verify-payment API                          │
│     → Failure: show error, allow retry                          │
│                                                                  │
│  6. Client calls verify-payment API                              │
│     → POST /api/checkout/verify-payment                         │
│     → Server verifies signature                                 │
│     → Server creates order in database                          │
│     → Server decrements stock                                   │
│     → Server clears cart                                        │
│     → Server sends confirmation email                           │
│                                                                  │
│  7. Redirect to confirmation page                                │
│     → /order-confirmed/:orderId                                │
│     → Show order number + details                               │
│                                                                  │
│  8. Webhook fallback                                             │
│     → Razorpay webhook confirms payment                         │
│     → Idempotent: won't create duplicate order                  │
│     → Handles case where client callback fails                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.18 Checkout API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/checkout/create-order` | POST | Create Razorpay order | Optional (guest token) |
| `/api/checkout/verify-payment` | POST | Verify payment + create order | Optional (guest token) |
| `/api/checkout/guest` | POST | Create guest checkout session | Optional |
| `/api/checkout/validate` | POST | Validate cart for checkout | Optional (guest token) |

### 4.19 Checkout Zod Schemas

```typescript
const checkoutAddressSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  line1: z.string().min(1).max(300),
  line2: z.string().max(300).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  country: z.string().default('IN'),
});

const createOrderSchema = z.object({
  addressId: z.string().uuid().optional(),
  address: checkoutAddressSchema.optional(),
  shippingMethodId: z.string().uuid(),
  couponCode: z.string().max(50).optional(),
  paymentMethod: z.enum(['razorpay']),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
```

---

## 5. Order Validation Architecture

### 5.1 What

Standards for validating every aspect of an order before creation — product availability, inventory, pricing, coupons, shipping, customer data, and duplicate prevention.

### 5.2 Why

- **Accuracy:** Wrong orders lose money and trust.
- **Integrity:** Prevent overselling, pricing errors, coupon abuse.
- **Compliance:** Financial records must be accurate.
- **Performance:** Catch errors before payment, not after.

### 5.3 Where

Checkout flow (pre-payment), API handlers (server-side), order creation, payment verification.

### 5.4 Product Availability Validation

| Check | Standard | Response |
|-------|----------|----------|
| **Product active** | Product must be active | "Product no longer available" |
| **Variant active** | Variant must be active | "Variant no longer available" |
| **In stock** | availableStock > 0 | "Out of stock" |
| **Sufficient stock** | availableStock ≥ quantity | "Only X available" |
| **Not discontinued** | Product not discontinued | "Product discontinued" |

### 5.5 Inventory Validation

| Check | Standard | Response |
|-------|----------|----------|
| **Stock check** | Atomic read + validate | Prevent race condition |
| **Reservation** | Reserve stock during checkout | Prevent overselling |
| **Timeout** | 15-minute reservation timeout | Release abandoned |
| **Concurrent access** | Database-level atomic operations | Prevent corruption |
| **Post-payment** | Decrement stock after payment confirm | Accuracy |

### 5.6 Pricing Validation

| Check | Standard | Response |
|-------|----------|----------|
| **Price match** | Cart price = current price | Update if changed |
| **Currency** | INR (default) | Reject other currencies |
| **Minimum** | Price > ₹0 | Reject zero/negative |
| **Maximum** | Price < ₹10,00,000 | Prevent abuse |
| **Consistency** | Total = sum of line items | Mathematical integrity |

### 5.7 Coupon Validation

| Check | Standard | Response |
|-------|----------|----------|
| **Exists** | Code exists in database | "Invalid coupon code" |
| **Active** | Coupon is active | "Coupon is no longer valid" |
| **Not expired** | Current date < expiry date | "Coupon has expired" |
| **Minimum order** | Subtotal ≥ minimum order | "Minimum order not met" |
| **Usage limit** | Usage count < limit | "Coupon usage limit reached" |
| **User restriction** | User eligible (if restricted) | "Coupon not valid for you" |
| **Product restriction** | Applicable products in cart | "Coupon not valid for these items" |
| **One per order** | Only one coupon per order | "Only one coupon per order" |

### 5.8 Shipping Validation

| Check | Standard | Response |
|-------|----------|----------|
| **Address complete** | All required fields filled | "Please complete address" |
| **Pincode valid** | 6-digit numeric | "Invalid pincode" |
| **Serviceable** | Pincode in delivery area | "We don't deliver to this pincode" |
| **Method available** | Shipping method available for address | "Method not available" |
| **Weight limit** | Order weight ≤ method limit | "Order too heavy for method" |

### 5.9 Customer Validation

| Check | Standard | Response |
|-------|----------|----------|
| **Guest checkout** | Email required for guest | "Email required for order updates" |
| **Phone** | Phone required for delivery | "Phone required for delivery" |
| **Email format** | Valid email format | "Invalid email address" |
| **Phone format** | Valid Indian phone | "Invalid phone number" |
| **Existing customer** | Check for existing account | "Log in for faster checkout" |

### 5.10 Duplicate Order Prevention

| Check | Standard | Response |
|-------|----------|----------|
| **Idempotency key** | Unique per checkout attempt | Prevent double-submit |
| **Payment dedup** | razorpayPaymentId unique | Prevent double-charge |
| **Time window** | 5-minute cooldown between orders | Prevent rapid duplicates |
| **Same cart** | Don't process same cart twice | Integrity |
| **Webhook idempotency** | Process webhook only once | Prevent duplicates |

---

## 6. Promotions Architecture

### 6.1 What

Architecture for coupons, discounts, promotional messages, savings display, free shipping rules, and future loyalty discounts.

### 6.2 Why

- **Conversion:** Discounts drive purchases.
- **Retention:** Loyalty discounts bring customers back.
- **Revenue:** Strategic promotions increase average order value.
- **Trust:** Transparent promotions build confidence.

### 6.3 Where

Cart page, checkout page, product cards, homepage, email notifications, admin coupon management.

### 6.4 Coupons Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Types** | Percentage, Fixed amount, Free shipping | Flexibility |
| **One per order** | Only one coupon per order | Business rule |
| **Minimum order** | Configurable minimum subtotal | Business rule |
| **Expiry** | Date-based expiry | Urgency |
| **Usage limit** | Per-coupon and per-user limits | Control |
| **Product restriction** | Apply to specific products/categories | Targeting |
| **User restriction** | Apply to specific users/groups | Personalization |

**Coupon Types:**

| Type | Example | Calculation |
|------|---------|-------------|
| **Percentage** | 10% off | subtotal × 0.10 |
| **Fixed** | ₹200 off | ₹200 |
| **Free shipping** | Free shipping | Shipping cost = ₹0 |

### 6.5 Discounts Architecture

| Type | Source | Display |
|------|--------|---------|
| **Sale price** | Admin-set sale price | Strikethrough original + new price |
| **Coupon** | Customer-applied code | Discount line in summary |
| **Bulk discount** | Quantity-based (future) | Per-item discount |
| **Loyalty discount** | Points-based (future) | Checkout discount |

### 6.6 Promotional Messages Architecture

| Message | Placement | Trigger |
|---------|-----------|---------|
| **"Free shipping on orders over ₹999"** | Product cards, cart | Cart total < ₹999 |
| **"You're ₹X away from free shipping!"** | Cart, checkout | Cart total < ₹999 |
| **"Sale: 20% off"** | Product cards, homepage | Active sale |
| **"Coupon SAVE10 applied — you save ₹X!"** | Cart, checkout | Coupon applied |
| **"Only X left in stock!"** | Product detail, cart | Low stock |
| **"Price dropped!"** | Wishlist | Price decrease |

### 6.7 Savings Display Architecture

| Context | Display | Rationale |
|---------|---------|-----------|
| **Product card** | "Sale: ₹X off" badge | Attention |
| **Product detail** | Strikethrough + sale price | Comparison |
| **Cart item** | "You save ₹X" per item | Reinforcement |
| **Order summary** | "You save ₹X total" | Confidence |
| **Confirmation** | "Total savings: ₹X" | Satisfaction |

### 6.8 Free Shipping Rules Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Threshold** | ₹999 (configurable) | Incentive |
| **Progress bar** | Show progress toward threshold | Motivation |
| **Announcement** | "Free shipping unlocked!" | Celebration |
| **Cart display** | "Add ₹X more for free shipping" | Guidance |
| **Checkout display** | "Free shipping applied" | Confirmation |

### 6.9 Future Loyalty Discounts Architecture

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Points earning** | Points per purchase | 1 point per ₹10 spent |
| **Points redemption** | Apply points at checkout | 1 point = ₹1 discount |
| **Tier system** | Bronze, Silver, Gold, Platinum | Spending thresholds |
| **Tier benefits** | Free shipping, exclusive discounts | Per-tier perks |
| **Birthday discount** | Annual discount on birthday | Profile-based |

---

## 7. Responsive UX Architecture

### 7.1 What

Standards for how the cart, wishlist, and checkout experience adapts across mobile, tablet, and desktop — ensuring premium, thumb-friendly experience at every viewport.

### 7.2 Why

- **Mobile-first:** 70%+ traffic is mobile.
- **Conversion:** Checkout friction directly loses sales.
- **Trust:** Consistent experience builds confidence.
- **Accessibility:** Works on every device and ability.

### 7.3 Where

Every cart, wishlist, and checkout component and interaction.

### 7.4 Mobile Checkout Standards (< 640px)

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Layout** | Single column, full-width | Simple |
| **Cart items** | Full-width cards | Readable |
| **Quantity controls** | Large +/- buttons | Touch-friendly |
| **Remove** | Swipe left | Natural gesture |
| **Address form** | Full-width fields | Readable |
| **Shipping options** | Radio cards, full-width | Touchable |
| **Order summary** | Collapsible, sticky bottom | Always accessible |
| **Checkout CTA** | Sticky bottom, full-width | Always visible |
| **Payment** | Razorpay modal, full-screen | Immersive |
| **Confirmation** | Full-screen success | Clear completion |
| **Touch targets** | Minimum 44x44px | Accuracy |
| **Font size** | 16px minimum | Readability (no zoom) |

### 7.5 Tablet Checkout Standards (640px - 1023px)

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Layout** | 2-column: form + summary | Balanced |
| **Cart items** | 2-column grid | Efficient |
| **Form fields** | Side-by-side where logical | Space-efficient |
| **Order summary** | Sticky right column | Always visible |
| **Checkout CTA** | Bottom of form column | Clear |

### 7.6 Desktop Checkout Standards (1024px+)

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Layout** | 2-column: form (60%) + summary (40%) | Balanced |
| **Cart items** | 2-column: items + summary | Clear |
| **Form fields** | Side-by-side where logical | Efficient |
| **Order summary** | Sticky right column | Always visible |
| **Mini cart** | Dropdown from header | Quick access |
| **Hover states** | Full hover effects | Desktop engagement |
| **Keyboard nav** | Full keyboard support | Accessibility |

### 7.7 One-Hand Usage Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary actions in thumb zone** | Bottom 1/3 of mobile screen | Ergonomics |
| **Sticky CTAs** | Primary buttons fixed on scroll | Always accessible |
| **Swipe actions** | Swipe to delete, not tap tiny button | Natural gesture |
| **Bottom sheet** | Modals slide up from bottom | Reachable |
| **Large touch targets** | Minimum 44x44px | Accuracy |

### 7.8 Thumb Reach Standards

| Zone | Reachability | Checkout Actions |
|------|-------------|-----------------|
| **Bottom zone** | Easy | Checkout CTA, quantity controls, address save |
| **Middle zone** | Moderate | Cart items, shipping options, form fields |
| **Top zone** | Hard | Header, breadcrumb, close button |
| **Left edge** | Easy (right thumb) | Back button |
| **Right edge** | Easy (left thumb) | Secondary actions |

### 7.9 Form Simplicity Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One column mobile** | Stacked fields | Simple |
| **Logical order** | Name → Phone → Address → City → State → Pincode | Flow |
| **Auto-fill** | Pincode → City/State auto-fill | Speed |
| **Inline validation** | On blur, not on submit | Immediate feedback |
| **Error placement** | Below the field | Context |
| **Keyboard type** | Numeric for phone/pincode | Appropriate keyboard |
| **No auto-capitalize** | For pincode, phone | Correct input |

---

## 8. Error Handling Architecture

### 8.1 What

Standards for handling every possible error in the cart, wishlist, and checkout flows — validation errors, payment errors, inventory changes, price changes, coupon failures, session expiry, and recovery flows.

### 8.2 Why

- **Trust:** Errors handled well build confidence.
- **Recovery:** Every error has a clear path forward.
- **Revenue:** Errors that block purchase lose sales.
- **Debugging:** Structured errors enable quick fixes.

### 8.3 Where

Every cart, wishlist, and checkout interaction — client-side and server-side.

### 8.4 Validation Errors Architecture

| Error | Display | Recovery |
|-------|---------|----------|
| **Required field** | Red border + "Required" below field | Fill the field |
| **Invalid email** | "Please enter a valid email" | Fix email |
| **Invalid phone** | "Please enter a valid 10-digit phone" | Fix phone |
| **Invalid pincode** | "Please enter a valid 6-digit pincode" | Fix pincode |
| **Invalid address** | "Please fill all address fields" | Complete form |

### 8.5 Payment Preparation Errors Architecture

| Error | Display | Recovery |
|-------|---------|----------|
| **Razorpay init failure** | "Payment service unavailable. Try again." | Retry |
| **Order creation failed** | "Unable to process order. Try again." | Retry |
| **Network error** | "Connection lost. Check your internet." | Retry |
| **Timeout** | "Request timed out. Try again." | Retry |

### 8.6 Inventory Changes Architecture

| Error | Display | Recovery |
|-------|---------|----------|
| **Out of stock** | "X is no longer available" + remove option | Remove item |
| **Low stock** | "Only X left — quantity adjusted" | Accept or remove |
| **Stock changed** | "Quantity adjusted to available stock" | Accept |
| **Variant unavailable** | "Select a different variant" | Re-select |

### 8.7 Price Changes Architecture

| Scenario | Display | Recovery |
|----------|---------|----------|
| **Price increased** | "Price updated to ₹X" + new total | Accept or remove |
| **Price decreased** | "Price dropped to ₹X — you save ₹X!" | Positive reinforcement |
| **Sale ended** | "Sale has ended — regular price ₹X" | Accept or remove |

### 8.8 Coupon Failures Architecture

| Error | Display | Recovery |
|-------|---------|----------|
| **Invalid code** | "Coupon code not found" | Re-enter code |
| **Expired** | "Coupon has expired" | Remove coupon |
| **Minimum not met** | "Minimum order ₹X required" | Add more items |
| **Usage limit** | "Coupon usage limit reached" | Remove coupon |
| **Product restriction** | "Coupon not valid for these items" | Adjust cart |
| **Already used** | "You've already used this coupon" | Remove coupon |
| **Network error** | "Unable to apply coupon. Try again." | Retry |

### 8.9 Session Expiry Architecture

| Scenario | Display | Recovery |
|----------|---------|----------|
| **Access token expired** | Auto-refresh silently | No interruption |
| **Refresh token expired** | "Session expired. Please log in." | Redirect to login |
| **Guest session expired** | "Session expired. Cart preserved." | Continue as guest |
| **CSRF token expired** | Auto-refresh token | No interruption |

### 8.10 Recovery Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR RECOVERY FLOW                            │
│                                                                  │
│  1. ERROR DETECTED                                               │
│     → Client or server detects error                            │
│     → Error classified by type and severity                     │
│                                                                  │
│  2. USER NOTIFICATION                                            │
│     → Toast for transient errors                                │
│     → Inline for form errors                                    │
│     → Modal for critical errors                                 │
│     → Always include recovery action                            │
│                                                                  │
│  3. STATE PRESERVATION                                           │
│     → Cart items preserved                                      │
│     → Form data preserved                                       │
│     → Scroll position preserved                                 │
│     → No data loss on error                                     │
│                                                                  │
│  4. RECOVERY ACTION                                              │
│     → "Try Again" for network errors                            │
│     → "Edit" for validation errors                              │
│     → "Remove" for unavailable items                            │
│     → "Login" for session errors                                │
│                                                                  │
│  5. RETRY (if applicable)                                        │
│     → Exponential backoff (1s, 2s, 4s)                         │
│     → Max 3 retries                                             │
│     → Show retry count                                          │
│     → After max retries: show permanent error                   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.11 Error Codes

| Code | Status | Description | Recovery |
|------|--------|-------------|----------|
| `CART_EMPTY` | 400 | Cart is empty | Add items |
| `ITEM_OUT_OF_STOCK` | 422 | Item no longer available | Remove item |
| `INSUFFICIENT_STOCK` | 422 | Not enough stock | Reduce quantity |
| `PRICE_CHANGED` | 422 | Price updated since cart | Accept new price |
| `COUPON_INVALID` | 422 | Coupon code invalid | Re-enter code |
| `COUPON_EXPIRED` | 422 | Coupon has expired | Remove coupon |
| `COUPON_MINIMUM_NOT_MET` | 422 | Minimum order not met | Add more items |
| `ADDRESS_INVALID` | 422 | Address validation failed | Fix address |
| `PINCODE_NOT_SERVICEABLE` | 422 | Cannot deliver to pincode | Change address |
| `PAYMENT_FAILED` | 422 | Payment processing failed | Retry payment |
| `ORDER_CREATION_FAILED` | 500 | Unable to create order | Retry |
| `DUPLICATE_ORDER` | 409 | Order already processed | Check orders |

---

## 9. Performance Architecture

### 9.1 What

Standards for cart, wishlist, and checkout performance — fast loading, lazy loading, progressive loading, optimistic updates, and checkout optimization.

### 9.2 Why

- **Conversion:** Slow checkout loses sales.
- **Trust:** Fast interactions feel professional.
- **Retention:** Performance affects return visits.
- **SEO:** Performance affects rankings.

### 9.3 Where

Every cart, wishlist, and checkout page and interaction.

### 9.4 Fast Loading Standards

| Resource | Strategy | Target |
|----------|----------|--------|
| **Cart page** | Skeleton loading | < 1s LCP |
| **Checkout page** | Skeleton loading | < 1.5s LCP |
| **Wishlist page** | Skeleton loading | < 1s LCP |
| **Mini cart** | Pre-loaded on hover | Instant |
| **API responses** | Edge-cached where possible | < 200ms |

### 9.5 Lazy Loading Standards

| Resource | Strategy | Rationale |
|----------|----------|-----------|
| **Checkout form** | Load on route entry | Required |
| **Order summary** | Load with checkout | Required |
| **Product images in cart** | Lazy load | Performance |
| **Related products** | Load on scroll | Below fold |
| **Payment SDK** | Load on checkout entry | Ready when needed |

### 9.6 Progressive Loading Standards

| Stage | Content | Rationale |
|-------|---------|-----------|
| **Instant** | Skeleton of cart/checkout layout | Perceived speed |
| **< 500ms** | Cart items with placeholders | Context |
| **< 1s** | Full cart with images | Complete view |
| **< 1.5s** | Checkout form ready | Interactive |

### 9.7 Checkout Optimization Standards

| Optimization | Implementation | Rationale |
|-------------|----------------|-----------|
| **Pre-validate** | Validate cart on entry | Catch issues early |
| **Pre-fetch** | Fetch shipping methods on address entry | Speed |
| **Optimistic updates** | Show expected result immediately | Perceived speed |
| **Debounced validation** | 500ms debounce on form fields | Performance |
| **Background sync** | Sync cart in background | No blocking |
| **Payment pre-load** | Load Razorpay SDK on checkout entry | Ready when needed |

### 9.8 Cart Optimization Standards

| Optimization | Implementation | Rationale |
|-------------|----------------|-----------|
| **TanStack Query** | Cache cart data | Avoid refetch |
| **Optimistic updates** | Update UI before server response | Instant feel |
| **Debounced quantity** | 500ms debounce on +/- | Prevent rapid calls |
| **Background sync** | Sync cart in background | No blocking |
| **Mini cart pre-load** | Prefetch on cart icon hover | Instant open |

### 9.9 Caching Strategy

| Data | TTL | Invalidation |
|------|-----|--------------|
| **Cart** | No cache (always fresh) | — |
| **Wishlist** | 5 min | On add/remove |
| **Shipping methods** | 1 min | On address change |
| **Coupon validation** | No cache (always fresh) | — |
| **Product prices** | 5 min | On price change |

---

## 10. Accessibility Architecture

### 10.1 What

WCAG 2.2 AA compliance standards for every cart, wishlist, and checkout component — keyboard support, screen readers, touch accessibility, reduced motion, and focus management.

### 10.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can purchase.
- **Quality:** Accessible code is better code.
- **Revenue:** Accessible checkout converts more.

### 10.3 Where

Every cart, wishlist, and checkout component and interaction.

### 10.4 Keyboard Support Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring (brand-500) | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Enter to submit** | Enter submits forms | Efficiency |
| **Escape to close** | ESC closes modals/sheets | Recovery |
| **Arrow keys** | Navigate within radio/checkbox groups | Familiar |
| **Skip link** | "Skip to main content" | Efficiency |
| **Focus management** | Return focus on modal close | Continuity |

### 10.5 Screen Reader Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | `<nav>`, `<main>`, `<button>`, `<form>` | Meaning |
| **ARIA landmarks** | Label regions | Navigation |
| **Form labels** | Associated with inputs | Understanding |
| **Error association** | `aria-describedby` for errors | Clarity |
| **Live regions** | `aria-live` for dynamic content | Updates |
| **Status announcements** | "Item added to cart" announced | Feedback |
| **Headings** | Proper H1-H6 hierarchy | Navigation |
| **Lists** | Use `<ul>`, `<ol>` for item lists | Structure |
| **Hidden decorative** | `aria-hidden="true"` for icons | Reduce noise |

### 10.6 Touch Accessibility Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min target** | 44x44px | Ease of use |
| **Spacing** | 8px between targets | Prevent miss-taps |
| **No hover only** | Works without hover | Touch devices |
| **Swipe alternatives** | Button alternatives for swipe | Accessibility |
| **Long press** | Optional, not required | Not all users |

### 10.7 Reduced Motion Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Honor preference** | `prefers-reduced-motion: reduce` | Vestibular disorders |
| **Disable animations** | Use CSS media query | Comfort |
| **Alternative feedback** | Use opacity/color instead of motion | Still informative |
| **No auto-play** | User controls playback | Control |
| **No flashing** | No content flashes > 3 times/second | Seizure prevention |

### 10.8 Focus Management Standards

| Context | Standard | Rationale |
|---------|----------|-----------|
| **Page load** | Focus on main content | Skip header |
| **Modal open** | Focus moves to modal | Trap focus |
| **Modal close** | Focus returns to trigger | Continuity |
| **Error** | Focus moves to first error | Guidance |
| **Toast** | `aria-live` announces | Screen reader |
| **Form submit** | Focus moves to success/error | Feedback |

---

## 11. Security Architecture

### 11.1 What

Standards for securing cart integrity, checkout validation, coupon abuse prevention, duplicate submission prevention, session security, and audit logging.

### 11.2 Why

- **Revenue:** Fraud loses money directly.
- **Trust:** Security breaches destroy brand.
- **Compliance:** Financial regulations require security.
- **Integrity:** Cart and order data must be accurate.

### 11.3 Where

Every cart, wishlist, and checkout API endpoint and client interaction.

### 11.4 Cart Integrity Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side validation** | Every cart operation validated server-side | Security |
| **Stock validation** | Real-time stock check on every add/update | Accuracy |
| **Price validation** | Server returns current price, client uses it | Integrity |
| **Quantity limits** | Max 10 per item, max 50 items | Abuse prevention |
| **Guest token** | Cryptographically random UUID | Unpredictable |
| **RLS** | Row-Level Security on cart tables | Data isolation |

### 11.5 Checkout Validation Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Double validation** | Validate on client AND server | Defense in depth |
| **Re-validate before payment** | Server validates everything again | Accuracy |
| **Idempotency keys** | Unique per checkout attempt | Prevent duplicates |
| **Amount verification** | Server amount must match Razorpay amount | Integrity |
| **Signature verification** | Verify Razorpay signature server-side | Security |

### 11.6 Coupon Abuse Prevention Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One per order** | Server enforces single coupon | Business rule |
| **Usage limits** | Per-coupon and per-user limits | Control |
| **Rate limiting** | Max 10 coupon attempts per minute | Abuse prevention |
| **Code complexity** | Minimum 6 characters, alphanumeric | Prevent guessing |
| **Expiry enforcement** | Server checks expiry on every apply | Accuracy |
| **Stacking prevention** | Server rejects multiple coupons | Business rule |

### 11.7 Duplicate Submission Prevention Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Button disable** | Disable during submission | Prevent double-click |
| **Idempotency key** | Unique per request | Server-side dedup |
| **Time window** | 5-minute cooldown between orders | Prevent rapid dupes |
| **Payment dedup** | razorpayPaymentId unique constraint | Prevent double-charge |
| **Webhook idempotency** | Process webhook only once | Prevent dupes |

### 11.8 Session Security Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Never store tokens in localStorage | XSS prevention |
| **CSRF protection** | Double-submit cookie pattern | CSRF prevention |
| **Secure flag** | HTTPS only | Transport security |
| **SameSite** | Strict or Lax | CSRF prevention |
| **Session rotation** | On sensitive operations | Session fixation prevention |
| **Max sessions** | 5 per user | Abuse prevention |

### 11.9 Audit Logging Standards

| Event | Data Logged | Rationale |
|-------|-------------|-----------|
| **Cart add** | variantId, quantity, userId/guestToken | Tracking |
| **Cart remove** | variantId, userId/guestToken | Tracking |
| **Checkout start** | userId/guestToken, cartTotal | Funnel analysis |
| **Order created** | orderId, amount, paymentMethod | Financial |
| **Payment success** | orderId, paymentId, amount | Financial |
| **Payment failure** | orderId, error code, amount | Debugging |
| **Coupon applied** | couponCode, discount amount, userId | Abuse detection |
| **Address created** | userId, pincode | Logistics |

---

## 12. Future Readiness Architecture

### 12.1 What

Architecture standards for future cart, wishlist, and checkout features — one-click checkout, express checkout, multi-address orders, gift orders, gift messages, saved payments, subscription checkout, and AI checkout assistant.

### 12.2 Why

- **Scalability:** New features extend without redesign.
- **Competitiveness:** Ready for market demands.
- **Innovation:** Architecture supports experimentation.
- **Investment:** Future-proof development effort.

### 12.3 Where

New features, extensions, integrations.

### 12.4 One-Click Checkout Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | "Buy Now" on product detail | Speed |
| **Pre-requisites** | Saved address + saved payment | Zero input |
| **Flow** | Add to cart → Create order → Payment → Confirm | Minimal steps |
| **Confirmation** | Same as standard checkout | Consistency |
| **Security** | Re-authenticate for payment | Protection |

### 12.5 Express Checkout Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Placement** | Above standard checkout | Visibility |
| **Options** | Google Pay, Apple Pay, PayPal | Familiar |
| **Flow** | Single tap → Payment → Confirm | Minimal steps |
| **Address** | Use saved or default | Speed |
| **Shipping** | Use default method | Speed |

### 12.6 Multi-Address Orders Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Split items** | Assign different items to different addresses | Flexibility |
| **Per-item address** | Address selection per cart item | Granularity |
| **Shipping cost** | Calculated per address | Accuracy |
| **Order splitting** | One order, multiple shipments | Tracking simplicity |
| **UI** | "Ship to different address" per item | Discoverable |

### 12.7 Gift Orders Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Gift toggle** | "This is a gift" checkbox | Discoverable |
| **Gift message** | Text field, max 200 chars | Personal touch |
| **Hide prices** | Don't show prices on packing slip | Surprise |
| **Gift wrapping** | Optional, with fee | Premium touch |
| **Gift receipt** | Separate receipt without prices | Thoughtful |

### 12.8 Gift Messages Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Placement** | Below gift toggle | Context |
| **Input** | Textarea, max 200 chars | Personal |
| **Preview** | Show preview of message | Quality |
| **Card** | Physical card option (future) | Premium |
| **Email** | Digital gift message option | Convenience |

### 12.9 Saved Payments Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Storage** | Razorpay vault (tokenized) | Security |
| **Display** | Card last 4 digits + brand | Recognition |
| **Default** | One default payment method | Speed |
| **Add** | During checkout, "Save for next time" | Convenience |
| **Delete** | Account settings, with confirmation | Control |
| **Security** | PCI-compliant via Razorpay | Compliance |

### 12.10 Subscription Checkout Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Product support** | Subscribe & Save option | Recurring revenue |
| **Frequency** | Weekly, Bi-weekly, Monthly | Flexibility |
| **Discount** | Subscribe discount (e.g., 10% off) | Incentive |
| **Management** | Pause, skip, cancel in account | Control |
| **Payment** | Auto-charge on schedule | Convenience |
| **Reminder** | Email before each charge | Transparency |

### 12.11 AI Checkout Assistant Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | Floating button on checkout | Discoverable |
| **Interface** | Chat-like overlay | Familiar |
| **Capabilities** | Address help, shipping advice, payment help | Helpful |
| **Context** | Aware of cart contents | Personalized |
| **Fallback** | "Talk to support" link | Human backup |
| **Privacy** | Clear data usage | Trust |

---

## 13. Mandatory Rules for AI Agents

### 13.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing the cart, wishlist, and checkout experience.

### 13.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every interaction meets the standard.
- **Revenue:** Cart and checkout directly affect revenue.

### 13.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Guest checkout** | Available without registration | Friction, abandonment |
| **Cart persistence** | Saved across sessions | Lost items, frustration |
| **Transparent pricing** | All costs visible before payment | Trust erosion |
| **Stock validation** | Real-time on every interaction | Overselling |
| **Price validation** | Server-side on every interaction | Pricing errors |
| **Duplicate prevention** | Idempotency keys + DB constraints | Double charges |
| **Mobile-first** | Design for 375px, enhance upward | 70%+ mobile |
| **Minimum steps** | 3 checkout screens or less | Conversion |
| **Error recovery** | Every error has clear recovery | Resilience |
| **Accessibility** | WCAG 2.2 AA compliance | Inclusivity |
| **Security** | Every request validated server-side | Protection |
| **No Shop Owner exposure** | Never show seller identity | Brand integrity |
| **Optimistic updates** | Show expected result immediately | Perceived speed |
| **Undo-friendly** | Reversible actions where possible | Confidence |
| **Real-time feedback** | Every action has visible response | Trust |
| **No hidden costs** | Transparent pricing throughout | Trust |
| **No forced registration** | Guest experience first | Conversion |
| **No cart clearing on error** | Preserve state through errors | Don't lose work |
| **No synchronous stock reservation** | Optimistic UI with background sync | Speed |
| **Checkout button always visible** | Sticky on mobile, prominent on desktop | Conversion |

### 13.4 Agent Decision Framework

When implementing any cart, wishlist, or checkout feature, agent must ask:

1. **Does this support guest checkout?** — Can a non-logged-in user complete this?
2. **Is this mobile-first?** — Would this work on a 375px screen?
3. **Is this transparent?** — Are all costs visible before commitment?
4. **Is this validated?** — Is stock, price, and coupon checked server-side?
5. **Is this recoverable?** — Can the user undo or go back?
6. **Is this fast?** — Will this feel instant?
7. **Is this clear?** — Would a first-time user understand this?
8. **Is this consistent?** — Does this match existing patterns?
9. **Is this secure?** — Is every request validated server-side?
10. **Is this minimal?** — Can any step be removed?

### 13.5 Implementation Checklist

Before shipping any cart, wishlist, or checkout feature:

- [ ] Guest checkout supported (if applicable)
- [ ] Cart persistence works across sessions
- [ ] Mobile-first design verified at 375px
- [ ] Touch targets minimum 44x44px
- [ ] Keyboard navigation works
- [ ] Screen reader announces all content
- [ ] Focus management correct
- [ ] Loading states present
- [ ] Error states with recovery
- [ ] Empty states with guidance
- [ ] Trust signals visible
- [ ] Transparent pricing
- [ ] Stock validation on all interactions
- [ ] Price validation on all interactions
- [ ] Coupon validation on apply
- [ ] Idempotency keys on payment
- [ ] Razorpay signature verification
- [ ] Audit logging enabled
- [ ] No Shop Owner identity leakage
- [ ] Premium visual treatment
- [ ] Consistent with existing patterns
- [ ] Performance budget met
- [ ] Accessibility audit passed

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
