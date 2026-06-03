-- =============================================
-- নবME — Neon PostgreSQL Schema
-- Run this in Neon SQL Editor (safe to re-run)
-- =============================================

-- ─── CATEGORIES ────────────────────────────
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  description   text,
  image         text,
  sort_order    integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_categories_slug on categories(slug);

-- ─── SUBCATEGORIES ─────────────────────────
create table if not exists subcategories (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete cascade,
  name          text not null,
  slug          text not null,
  description   text,
  sort_order    integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(category_id, slug)
);

create index if not exists idx_subcategories_category on subcategories(category_id);

-- ─── USERS (Neon-side mirror for role mgmt) ─
create table if not exists users (
  id            text primary key,
  full_name     text,
  email         text,
  phone         text,
  gender        text,
  role          text not null default 'customer'
                check (role in ('customer', 'vendor', 'admin', 'super_admin')),
  profile_image text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── VENDORS ───────────────────────────────
create table if not exists vendors (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null references users(id) on delete cascade unique,
  shop_name       text not null,
  shop_slug       text not null unique,
  shop_logo       text,
  shop_banner     text,
  shop_description text,
  shop_category   text,
  shop_email      text,
  shop_phone      text,
  shop_address    text,
  rating          numeric(2,1) default 0,
  reviews_count   integer default 0,
  total_products  integer default 0,
  total_orders    integer default 0,
  approval_status text not null default 'pending'
                  check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_vendors_user_id on vendors(user_id);
create index if not exists idx_vendors_slug on vendors(shop_slug);
create index if not exists idx_vendors_status on vendors(approval_status);

-- ─── PRODUCTS ──────────────────────────────
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references vendors(id) on delete cascade,
  name            text not null,
  slug            text not null,
  description     text,
  short_description text,
  category_id     uuid references categories(id),
  subcategory_id  uuid references subcategories(id),
  brand           text,
  gender          text check (gender in ('Male', 'Female', 'Unisex')),
  material        text,
  tags            text[] default '{}',
  status          text not null default 'draft'
                  check (status in ('draft', 'pending_approval', 'published', 'rejected', 'archived')),
  rejection_note  text,
  is_new          boolean default false,
  is_bestseller   boolean default false,
  is_featured     boolean default false,
  is_limited      boolean default false,
  average_rating  numeric(2,1) default 0,
  reviews_count   integer default 0,
  sold_count      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_products_vendor on products(vendor_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_slug on products(slug);

-- ─── PRODUCT VARIANTS ──────────────────────
create table if not exists product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  sku             text,
  size            text not null,
  color           text not null,
  price           integer not null,
  original_price  integer,
  stock           integer default 0,
  reserved_stock  integer default 0,
  in_stock        boolean default true,
  is_primary      boolean default false,
  sort_order      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(product_id, size, color)
);

create index if not exists idx_variants_product on product_variants(product_id);

-- ─── PRODUCT IMAGES ────────────────────────
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  integer default 0,
  is_primary  boolean default false,
  created_at  timestamptz default now()
);

create index if not exists idx_images_product on product_images(product_id);

-- ─── ADDRESSES (Neon-side) ─────────────────
create table if not exists addresses (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null references users(id) on delete cascade,
  receiver_name  text not null,
  receiver_phone text not null,
  address        text not null,
  city           text not null,
  district       text,
  state          text not null,
  pincode        text not null,
  is_default     boolean default false,
  created_at     timestamptz default now()
);

create index if not exists idx_addresses_user on addresses(user_id);

-- ─── ORDERS ────────────────────────────────
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,
  user_id          text references users(id),
  customer_name    text not null,
  customer_email   text,
  customer_phone   text not null,
  shipping_name    text,
  shipping_phone   text,
  shipping_email   text,
  shipping_address text,
  shipping_district text,
  shipping_city    text,
  shipping_state   text,
  shipping_pincode text,
  subtotal         integer not null default 0,
  discount_amount  integer default 0,
  coupon_code      text,
  shipping_cost    integer default 0,
  tax_amount       integer default 0,
  tax_label        text default 'GST 5%',
  grand_total      integer not null default 0,
  payment_method   text not null default 'whatsapp',
  payment_status   text not null default 'pending'
                   check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status     text not null default 'pending'
                   check (order_status in ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  utr              text,
  tracking_number  text,
  courier_name     text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  delivered_at     timestamptz
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_number on orders(order_number);
create index if not exists idx_orders_status on orders(order_status);
create index if not exists idx_orders_created on orders(created_at desc);

-- ─── ORDER ITEMS ───────────────────────────
create table if not exists order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  text,
  variant_id  uuid references product_variants(id),
  vendor_id   uuid references vendors(id),
  name        text not null,
  image       text,
  size        text,
  color       text,
  price       integer not null,
  quantity    integer not null default 1,
  subtotal    integer not null default 0,
  created_at  timestamptz default now()
);

create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_vendor on order_items(vendor_id);

-- ─── ORDER TIMELINE ────────────────────────
create table if not exists order_timeline (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  status      text not null,
  label       text not null,
  note        text,
  created_at  timestamptz default now()
);

create index if not exists idx_timeline_order on order_timeline(order_id);

-- ─── REVIEWS ───────────────────────────────
create table if not exists reviews (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  user_id         text references users(id),
  order_id        uuid references orders(id),
  rating          integer not null check (rating between 1 and 5),
  title           text,
  comment         text,
  images          text[] default '{}',
  is_verified     boolean default false,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  likes_count     integer default 0,
  dislikes_count  integer default 0,
  vendor_reply    text,
  vendor_replied_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_reviews_product on reviews(product_id);
create index if not exists idx_reviews_user on reviews(user_id);
create index if not exists idx_reviews_status on reviews(status);

-- ─── COUPONS ───────────────────────────────
create table if not exists coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  description      text,
  discount_type    text not null check (discount_type in ('flat', 'percentage', 'free_shipping')),
  discount_value   integer not null,
  min_order_amount integer default 0,
  max_discount     integer,
  max_uses         integer,
  used_count       integer default 0,
  is_active        boolean default true,
  expires_at       timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_coupons_code on coupons(code);

-- ─── NOTIFICATIONS ─────────────────────────
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     text references users(id),
  type        text not null check (type in ('system','offer','order','alert')),
  title       text not null,
  message     text,
  data        jsonb,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_unread on notifications(user_id) where is_read = false;

-- ─── SUPPORT TICKETS ───────────────────────
create table if not exists support_tickets (
  id            uuid primary key default gen_random_uuid(),
  user_id       text references users(id),
  order_id      uuid references orders(id),
  subject       text not null,
  message       text not null,
  status        text not null default 'open'
                check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority      text not null default 'medium'
                check (priority in ('low', 'medium', 'high', 'urgent')),
  category      text not null default 'other'
                check (category in ('order','payment','return','product','vendor','other')),
  attachments   text[] default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_tickets_user on support_tickets(user_id);
create index if not exists idx_tickets_status on support_tickets(status);

-- ─── USER CART (JSON-based) ────────────────
create table if not exists user_cart (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references users(id) on delete cascade unique,
  items       jsonb not null default '[]'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── USER WISHLIST (JSON-based) ────────────
create table if not exists user_wishlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references users(id) on delete cascade unique,
  items       jsonb not null default '[]'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── INVENTORY MOVEMENTS (audit log) ───────
create table if not exists inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  variant_id      uuid references product_variants(id),
  product_id      uuid references products(id),
  quantity_change integer not null,
  reason          text not null,
  reference_type  text,
  reference_id    text,
  created_at      timestamptz default now()
);

create index if not exists idx_inventory_variant on inventory_movements(variant_id);

-- ─── SITE SETTINGS ─────────────────────────
create table if not exists site_settings (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ─── NEWSLETTER SUBSCRIBERS ────────────────
create table if not exists newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  subscribed_at timestamptz default now()
);
