-- =============================================
-- নবME Ecommerce Database Schema
-- =============================================

-- ─── PRODUCTS (core product info) ──────────
create table if not exists products (
  id           text primary key,
  name         text not null,
  bengali_name text,
  description  text,
  bengali_description text,
  category     text,
  subcategory  text,
  material     text,
  fit          text,
  is_new       boolean default false,
  is_bestseller boolean default false,
  is_limited   boolean default false,
  tags         text[] default '{}',
  rating       numeric(2,1) default 0,
  reviews_count integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── PRODUCT VARIANTS (each size+color = one row) ──
create table if not exists product_variants (
  id            uuid primary key default gen_random_uuid(),
  product_id    text references products(id) on delete cascade,
  sku           text,
  size          text not null,
  color         text not null,
  price         integer not null,
  original_price integer,
  stock         integer default 0,
  in_stock      boolean default true,
  is_primary    boolean default false,
  unique(product_id, size, color)
);

-- ─── PRODUCT IMAGES (one row per image) ────
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  integer default 0,
  is_primary  boolean default false
);

-- ─── CUSTOMERS ─────────────────────────────
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  email       text,
  phone       text,
  name        text,
  created_at  timestamptz default now()
);

-- ─── ADDRESSES (multiple per customer) ─────
create table if not exists addresses (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references customers(id) on delete cascade,
  label        text default 'Home',
  name         text not null,
  phone        text,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text not null,
  pincode      text not null,
  is_default   boolean default false
);

-- ─── ORDERS ────────────────────────────────
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  bill_no         text unique not null,
  customer_id     uuid references customers(id),
  customer_snapshot jsonb,
  customer_name   text,
  customer_email  text,
  customer_phone  text,
  shipping_address_id uuid references addresses(id),
  subtotal        integer not null default 0,
  shipping_cost   integer default 0,
  discount_amount integer default 0,
  coupon_code     text,
  tax_amount      integer default 0,
  tax_label       text,
  total           integer not null,
  payment_method  text not null,
  payment_status  text default 'pending',
  order_status    text default 'confirmed',
  user_email      text,
  utr             text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── ORDER ITEMS (one row per line item) ───
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  product_id    text references products(id),
  variant_id    uuid references product_variants(id),
  product_name  text not null,
  variant_size  text,
  variant_color text,
  product_image text,
  quantity      integer not null,
  unit_price    integer not null,
  total_price   integer not null
);

-- ─── ORDER STATUS HISTORY ──────────────────
create table if not exists order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id) on delete cascade,
  status      text not null,
  note        text,
  changed_by  text,
  created_at  timestamptz default now()
);

-- ─── INVENTORY MOVEMENTS (stock audit) ─────
create table if not exists inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  variant_id      uuid references product_variants(id),
  product_id      text references products(id),
  quantity_change integer not null,
  reason          text not null,
  reference_type  text,
  reference_id    text,
  created_at      timestamptz default now()
);

-- ─── REVIEWS ───────────────────────────────
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    text references products(id) on delete cascade,
  customer_id   uuid references customers(id),
  customer_name text,
  rating        integer not null check(rating between 1 and 5),
  title         text,
  body          text,
  is_approved   boolean default false,
  created_at    timestamptz default now()
);

-- ─── COUPONS ───────────────────────────────
create table if not exists coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  discount_type    text not null check(discount_type in ('percentage','fixed')),
  discount_value   integer not null,
  min_order_amount integer default 0,
  max_uses         integer,
  used_count       integer default 0,
  is_active        boolean default true,
  expires_at       timestamptz,
  created_at       timestamptz default now()
);

-- ─── NEWSLETTER SUBSCRIBERS ────────────────
create table if not exists newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  subscribed_at timestamptz default now()
);

-- ─── PROFILES (synced with auth.users) ─────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text,
  phone        text,
  email        text,
  address      text,
  city         text,
  state        text,
  pincode      text,
  customer_upi text,
  role         text default 'customer',
  updated_at   timestamptz default now()
);
alter table profiles add column if not exists role text default 'customer';

-- ─── WISHLISTS ─────────────────────────────
create table if not exists wishlists (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  product_id  text references products(id),
  variant_id  uuid references product_variants(id),
  created_at  timestamptz default now(),
  unique(customer_id, product_id, variant_id)
);

-- ─── CARTS (server-side cart persistence) ──
create table if not exists carts (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  session_id  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid references carts(id) on delete cascade,
  variant_id  uuid references product_variants(id),
  quantity    integer default 1,
  created_at  timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table inventory_movements enable row level security;
alter table reviews enable row level security;
alter table coupons enable row level security;
alter table newsletter_subscribers enable row level security;
alter table profiles enable row level security;
alter table wishlists enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;

-- PUBLIC READ
create policy "Products public read" on products for select using (true);
create policy "Product variants public read" on product_variants for select using (true);
create policy "Product images public read" on product_images for select using (true);
create policy "Reviews public read approved" on reviews for select using (is_approved = true or auth.role() = 'authenticated');

-- AUTHENTICATED WRITE (admin via dashboard)
create policy "Products write for authed" on products for insert with check (auth.role() = 'authenticated');
create policy "Products update for authed" on products for update using (auth.role() = 'authenticated');
create policy "Products delete for authed" on products for delete using (auth.role() = 'authenticated');
create policy "Variants write for authed" on product_variants for insert with check (auth.role() = 'authenticated');
create policy "Variants update for authed" on product_variants for update using (auth.role() = 'authenticated');
create policy "Variants delete for authed" on product_variants for delete using (auth.role() = 'authenticated');
create policy "Images write for authed" on product_images for insert with check (auth.role() = 'authenticated');

-- CUSTOMERS
create policy "Customers insert anyone" on customers for insert with check (true);
create policy "Customers read own" on customers for select using (auth.role() = 'authenticated' or id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ADDRESSES
create policy "Addresses insert anyone" on addresses for insert with check (true);
create policy "Addresses read own" on addresses for select using (auth.role() = 'authenticated');
create policy "Addresses update own" on addresses for update using (auth.role() = 'authenticated');
create policy "Addresses delete own" on addresses for delete using (auth.role() = 'authenticated');

-- ORDERS
create policy "Orders insert anyone" on orders for insert with check (true);
create policy "Orders read own" on orders for select using (auth.role() = 'authenticated' or user_email = current_setting('request.jwt.claims', true)::json->>'email');
create policy "Orders update for authed" on orders for update using (auth.role() = 'authenticated');

-- ORDER ITEMS
create policy "Order items insert" on order_items for insert with check (true);
create policy "Order items read" on order_items for select using (true);

-- ORDER STATUS HISTORY
create policy "Status history insert" on order_status_history for insert with check (true);
create policy "Status history read" on order_status_history for select using (true);

-- INVENTORY
create policy "Inventory movements read" on inventory_movements for select using (auth.role() = 'authenticated');
create policy "Inventory movements insert" on inventory_movements for insert with check (auth.role() = 'authenticated');

-- NEWSLETTER
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);

-- PROFILES
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users read own profile" on profiles for select using (auth.uid() = id);

-- WISHLISTS
create policy "Wishlists manage own" on wishlists for all using (auth.role() = 'authenticated');

-- CARTS
create policy "Carts manage own" on carts for all using (auth.role() = 'authenticated');
create policy "Cart items manage own" on cart_items for all using (true);

-- COUPONS
create policy "Coupons read public" on coupons for select using (is_active = true);
