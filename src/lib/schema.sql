-- =============================================
-- নবME Complete Production Schema
-- Run in Neon PostgreSQL or Supabase SQL Editor
-- =============================================

-- ─── EXTENSIONS ─────────────────────────────
create extension if not exists "pgcrypto";

-- ─── USERS (extends Supabase auth.users) ────
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique,
  phone         text unique,
  name          text not null default '',
  role          text not null default 'customer' check (role in ('customer','vendor','admin')),
  status        text not null default 'active' check (status in ('active','suspended','banned')),
  avatar_url    text,
  gender        text check (gender in ('male','female','other','prefer_not_to_say')),
  last_login    timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_phone on public.users(phone);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_status on public.users(status);

-- ─── VENDORS (extends users) ────────────────
create table if not exists public.vendors (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade unique,
  shop_name         text not null,
  shop_slug         text not null unique,
  shop_description  text default '',
  shop_logo         text,
  shop_banner       text,
  shop_email        text,
  shop_phone        text,
  shop_address      text,
  shop_city         text,
  shop_state        text,
  shop_pincode      text,
  gst_number        text,
  pan_number        text,
  approval_status   text not null default 'pending' check (approval_status in ('pending','approved','rejected','suspended')),
  approval_note     text,
  approved_by       uuid references public.users(id),
  approved_at       timestamptz,
  rating            numeric(2,1) default 0,
  reviews_count     integer default 0,
  total_products    integer default 0,
  total_orders      integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_vendors_slug on public.vendors(shop_slug);
create index if not exists idx_vendors_status on public.vendors(approval_status);
create index if not exists idx_vendors_user on public.vendors(user_id);

-- ─── CATEGORIES ─────────────────────────────
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  description   text,
  icon          text,
  image_url     text,
  sort_order    integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ─── SUBCATEGORIES ──────────────────────────
create table if not exists public.subcategories (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories(id) on delete cascade,
  name          text not null,
  slug          text not null,
  description   text,
  sort_order    integer default 0,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  unique(category_id, slug)
);

-- ─── PRODUCTS ───────────────────────────────
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  vendor_id         uuid references public.vendors(id) on delete set null,
  name              text not null,
  slug              text not null unique,
  bengali_name      text,
  description       text default '',
  bengali_description text default '',
  category_id       uuid references public.categories(id),
  subcategory_id    uuid references public.subcategories(id),
  brand             text default '',
  material          text default '',
  fit               text default '',
  weight            text default '',
  gender            text check (gender in ('men','women','unisex','kids')),
  season            text check (season in ('summer','winter','spring','autumn','all')),
  collection        text default '',
  tags              text[] default '{}',
  status            text not null default 'draft' check (status in ('draft','pending_approval','published','rejected','archived')),
  rejection_note    text,
  approved_by       uuid references public.users(id),
  approved_at       timestamptz,
  is_featured       boolean default false,
  rating            numeric(2,1) default 0,
  reviews_count     integer default 0,
  sales_count       integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_products_vendor on public.products(vendor_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_slug on public.products(slug);

-- ─── PRODUCT VARIANTS ───────────────────────
create table if not exists public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  sku             text,
  size            text not null,
  color           text not null,
  color_swatch    text,
  price           integer not null,
  original_price  integer,
  stock           integer default 0,
  reserved_stock  integer default 0,
  in_stock        boolean default true,
  is_primary      boolean default false,
  sort_order      integer default 0,
  created_at      timestamptz default now(),
  unique(product_id, size, color)
);

create index if not exists idx_product_variants_product on public.product_variants(product_id);

-- ─── PRODUCT IMAGES ─────────────────────────
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  variant_id    uuid references public.product_variants(id) on delete set null,
  url           text not null,
  alt           text default '',
  sort_order    integer default 0,
  is_primary    boolean default false,
  created_at    timestamptz default now()
);

create index if not exists idx_product_images_product on public.product_images(product_id);

-- ─── CART ───────────────────────────────────
create table if not exists public.cart (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  session_id    text,
  product_id    uuid not null references public.products(id) on delete cascade,
  variant_id    uuid references public.product_variants(id) on delete cascade,
  quantity      integer not null default 1 check (quantity > 0),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_cart_user on public.cart(user_id);
create index if not exists idx_cart_session on public.cart(session_id);

-- ─── WISHLIST ───────────────────────────────
create table if not exists public.wishlist (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  created_at    timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlist(user_id);

-- ─── ADDRESSES ──────────────────────────────
create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  label         text default 'Home',
  name          text not null,
  phone         text not null,
  email         text,
  address       text not null,
  district      text,
  city          text not null,
  state         text not null,
  pincode       text not null,
  landmark      text,
  is_default    boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ─── ORDERS ─────────────────────────────────
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  user_id           uuid references public.users(id),
  customer_name     text not null,
  customer_email    text,
  customer_phone    text not null,
  shipping_address_id uuid references public.addresses(id),
  shipping_name     text,
  shipping_phone    text,
  shipping_email    text,
  shipping_address  text,
  shipping_district text,
  shipping_city     text,
  shipping_state    text,
  shipping_pincode  text,
  billing_same      boolean default true,
  subtotal          integer not null default 0,
  discount_amount   integer default 0,
  coupon_code       text,
  shipping_cost     integer default 0,
  tax_amount        integer default 0,
  tax_label         text default 'GST 5%',
  grand_total       integer not null,
  payment_method    text not null check (payment_method in ('cod','upi','whatsapp','card','net_banking','wallet','phonepe','gpay','paytm')),
  payment_status    text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_ref       text,
  utr               text,
  order_status      text not null default 'pending' check (order_status in ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  vendor_id         uuid references public.vendors(id),
  vendor_notes      text,
  admin_notes       text,
  tracking_number   text,
  courier_name      text,
  estimated_delivery timestamptz,
  delivered_at      timestamptz,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(order_status);
create index if not exists idx_orders_vendor on public.orders(vendor_id);
create index if not exists idx_orders_number on public.orders(order_number);

-- ─── ORDER ITEMS ────────────────────────────
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id),
  variant_id      uuid references public.product_variants(id),
  vendor_id       uuid references public.vendors(id),
  name            text not null,
  image           text,
  size            text,
  color           text,
  price           integer not null,
  quantity        integer not null default 1,
  subtotal        integer not null,
  created_at      timestamptz default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ─── ORDER TIMELINE ─────────────────────────
create table if not exists public.order_timeline (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  status        text not null,
  label         text not null,
  note          text,
  created_at    timestamptz default now()
);

create index if not exists idx_order_timeline_order on public.order_timeline(order_id);

-- ─── REVIEWS ────────────────────────────────
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  title         text default '',
  comment       text default '',
  images        text[] default '{}',
  is_verified   boolean default false,
  status        text not null default 'active' check (status in ('active','hidden','reported')),
  likes_count   integer default 0,
  dislikes_count integer default 0,
  vendor_reply  text,
  vendor_replied_at timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_user on public.reviews(user_id);

-- ─── REVIEW REACTIONS ───────────────────────
create table if not exists public.review_reactions (
  id            uuid primary key default gen_random_uuid(),
  review_id     uuid not null references public.reviews(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  reaction      text not null check (reaction in ('like','dislike','report')),
  created_at    timestamptz default now(),
  unique(review_id, user_id, reaction)
);

-- ─── NOTIFICATIONS ──────────────────────────
create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id),
  vendor_id     uuid references public.vendors(id),
  type          text not null check (type in ('order','product','review','vendor','system','promotion','return','support')),
  title         text not null,
  message       text not null,
  data          jsonb,
  is_read       boolean default false,
  created_at    timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_vendor on public.notifications(vendor_id);
create index if not exists idx_notifications_read on public.notifications(is_read);

-- ─── COUPONS ────────────────────────────────
create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  description     text,
  discount_type   text not null check (discount_type in ('percentage','fixed','free_shipping')),
  discount_value  integer not null,
  min_order_value integer default 0,
  max_discount    integer,
  usage_limit     integer default 0,
  used_count      integer default 0,
  per_user_limit  integer default 1,
  applicable_to   text default 'all' check (applicable_to in ('all','vendor','category','product')),
  applicable_ids  text[] default '{}',
  is_active       boolean default true,
  starts_at       timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz default now()
);

create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_coupons_active on public.coupons(is_active);

-- ─── COUPON REDEMPTIONS ─────────────────────
create table if not exists public.coupon_redemptions (
  id            uuid primary key default gen_random_uuid(),
  coupon_id     uuid not null references public.coupons(id),
  user_id       uuid not null references public.users(id),
  order_id      uuid references public.orders(id),
  discount      integer not null,
  created_at    timestamptz default now()
);

-- ─── BANNERS ────────────────────────────────
create table if not exists public.banners (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subtitle      text,
  description   text,
  image_url     text not null,
  link_url      text,
  link_text     text default 'Shop Now',
  position      text default 'home' check (position in ('home','category','sidebar','promo')),
  sort_order    integer default 0,
  is_active     boolean default true,
  starts_at     timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz default now()
);

-- ─── SUPPORT TICKETS ────────────────────────
create table if not exists public.support_tickets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id),
  order_id      uuid references public.orders(id) on delete set null,
  subject       text not null,
  message       text not null,
  category      text not null check (category in ('order','product','payment','return','vendor','account','other')),
  priority      text default 'normal' check (priority in ('low','normal','high','urgent')),
  status        text not null default 'open' check (status in ('open','in_progress','waiting_on_customer','resolved','closed')),
  assigned_to   uuid references public.users(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_tickets_user on public.support_tickets(user_id);
create index if not exists idx_tickets_status on public.support_tickets(status);

-- ─── TICKET RESPONSES ───────────────────────
create table if not exists public.ticket_responses (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.support_tickets(id) on delete cascade,
  user_id       uuid references public.users(id),
  message       text not null,
  is_staff      boolean default false,
  created_at    timestamptz default now()
);

-- ─── RETURNS ────────────────────────────────
create table if not exists public.returns (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  order_item_id     uuid references public.order_items(id),
  user_id           uuid not null references public.users(id),
  reason            text not null check (reason in ('wrong_product','damaged','size_issue','quality_issue','other')),
  reason_text       text,
  images            text[] default '{}',
  status            text not null default 'requested' check (status in ('requested','vendor_review','admin_review','approved','rejected','return_completed','refund_completed')),
  vendor_note       text,
  vendor_decision   text check (vendor_decision in ('approve','reject')),
  vendor_reviewed_at timestamptz,
  admin_note        text,
  admin_decision    text check (admin_decision in ('approve','reject')),
  admin_reviewed_at timestamptz,
  refund_amount     integer,
  refund_method     text,
  refund_processed_at timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_returns_order on public.returns(order_id);
create index if not exists idx_returns_user on public.returns(user_id);

-- ─── SYSTEM LOGS ────────────────────────────
create table if not exists public.system_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id),
  action        text not null,
  entity_type   text,
  entity_id     text,
  details       jsonb,
  ip_address    text,
  created_at    timestamptz default now()
);

create index if not exists idx_logs_user on public.system_logs(user_id);
create index if not exists idx_logs_action on public.system_logs(action);
create index if not exists idx_logs_created on public.system_logs(created_at);

-- ─── NEWSLETTER SUBSCRIBERS ─────────────────
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text,
  is_active     boolean default true,
  subscribed_at timestamptz default now()
);

-- ─── SEARCH HISTORY ─────────────────────────
create table if not exists public.search_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete cascade,
  query         text not null,
  created_at    timestamptz default now()
);

create index if not exists idx_search_user on public.search_history(user_id);

-- ─── RECENTLY VIEWED ────────────────────────
create table if not exists public.recently_viewed (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  viewed_at     timestamptz default now(),
  unique(user_id, product_id)
);

-- ─── ROW LEVEL SECURITY ─────────────────────

-- Users can read/update own profile
alter table public.users enable row level security;
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users for select using (auth.uid() = id or auth.role() = 'service_role');
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- Products: published visible to all, vendors see own, admins see all
alter table public.products enable row level security;
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products for select using (
  status = 'published'
  or auth.uid() in (select user_id from public.vendors where id = vendor_id)
  or auth.role() = 'service_role'
  or (select role from public.users where id = auth.uid()) = 'admin'
);

-- Vendors: public can view approved
alter table public.vendors enable row level security;
drop policy if exists "vendors_select" on public.vendors;
create policy "vendors_select" on public.vendors for select using (
  approval_status = 'approved'
  or user_id = auth.uid()
  or auth.role() = 'service_role'
  or (select role from public.users where id = auth.uid()) = 'admin'
);

-- Orders: customers see own, vendors see assigned, admins see all
alter table public.orders enable row level security;
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select using (
  user_id = auth.uid()
  or vendor_id in (select id from public.vendors where user_id = auth.uid())
  or auth.role() = 'service_role'
  or (select role from public.users where id = auth.uid()) = 'admin'
);

-- Reviews: all can read active
alter table public.reviews enable row level security;
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select using (status = 'active' or user_id = auth.uid() or auth.role() = 'service_role');

-- Cart: users manage own
alter table public.cart enable row level security;
drop policy if exists "cart_select" on public.cart;
create policy "cart_select" on public.cart for select using (user_id = auth.uid() or auth.role() = 'service_role');
drop policy if exists "cart_insert" on public.cart;
create policy "cart_insert" on public.cart for insert with check (user_id = auth.uid());
drop policy if exists "cart_update" on public.cart;
create policy "cart_update" on public.cart for update using (user_id = auth.uid());
drop policy if exists "cart_delete" on public.cart;
create policy "cart_delete" on public.cart for delete using (user_id = auth.uid());

-- Addresses: users manage own
alter table public.addresses enable row level security;
drop policy if exists "addresses_select" on public.addresses;
create policy "addresses_select" on public.addresses for select using (user_id = auth.uid() or auth.role() = 'service_role');
drop policy if exists "addresses_insert" on public.addresses;
create policy "addresses_insert" on public.addresses for insert with check (user_id = auth.uid());
drop policy if exists "addresses_update" on public.addresses;
create policy "addresses_update" on public.addresses for update using (user_id = auth.uid());
drop policy if exists "addresses_delete" on public.addresses;
create policy "addresses_delete" on public.addresses for delete using (user_id = auth.uid());

-- ─── FUNCTIONS ──────────────────────────────

-- Auto-create users record on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, phone, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'name', new.email, 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists users_updated_at
  before update on public.users for each row execute function public.update_updated_at();
create trigger if not exists vendors_updated_at
  before update on public.vendors for each row execute function public.update_updated_at();
create trigger if not exists products_updated_at
  before update on public.products for each row execute function public.update_updated_at();
create trigger if not exists orders_updated_at
  before update on public.orders for each row execute function public.update_updated_at();

-- ─── SEED DATA ──────────────────────────────

-- Seed categories
insert into public.categories (name, slug, description, sort_order) values
  ('Men', 'men', 'Premium streetwear & essentials for men', 1),
  ('Women', 'women', 'Contemporary fashion & style for women', 2),
  ('Kids', 'kids', 'Trendy & comfortable wear for kids', 3),
  ('Footwear', 'footwear', 'Sneakers, slides & more', 4),
  ('Accessories', 'accessories', 'Bags, belts & extras', 5),
  ('Jewelry', 'jewelry', 'Modern & traditional pieces', 6),
  ('Sportswear', 'sportswear', 'Activewear & athleisure', 7),
  ('Ethnic Wear', 'ethnic-wear', 'Festive & cultural attire', 8)
on conflict (slug) do nothing;

-- Seed admin user (run after creating admin in Supabase Auth)
-- insert into public.users (id, email, name, role) values ('ADMIN_USER_ID', 'nabome@admin.com', 'Admin', 'admin') on conflict (id) do nothing;
