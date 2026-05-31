-- =============================================
-- নবME Database Schema for Supabase
-- Run this in Supabase SQL Editor (one time)
-- =============================================

-- 1. PRODUCTS
create table if not exists products (
  id text primary key,
  name text not null,
  bengali_name text,
  price integer not null,
  original_price integer,
  description text,
  bengali_description text,
  image text,
  images text[] default '{}',
  category text,
  subcategory text,
  sizes text[],
  colors text[],
  stock integer default 10,
  in_stock boolean default true,
  is_new boolean default false,
  is_bestseller boolean default false,
  is_limited boolean default false,
  tags text[] default '{}',
  material text,
  fit text,
  rating numeric(2,1) default 0,
  reviews integer default 0,
  created_at timestamptz default now()
);

-- 2. CUSTOMERS
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  customer_upi text,
  created_at timestamptz default now()
);

-- 3. ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  bill_no text unique not null,
  customer_id uuid references customers(id),
  customer_snapshot jsonb not null,
  items jsonb not null,
  shipping integer default 0,
  tax_label text,
  total integer not null,
  payment_method text not null,
  payment_status text default 'pending',
  order_status text default 'confirmed',
  user_email text,
  utr text,
  created_at timestamptz default now()
);

-- 4. NEWSLETTER SUBSCRIBERS
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now()
);

-- 5. PROFILES (synced with auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  customer_upi text,
  updated_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table newsletter_subscribers enable row level security;
alter table profiles enable row level security;

-- Products: public read
create policy "Products are publicly readable"
  on products for select
  using (true);

-- Products: only authenticated users can insert/update (you via dashboard)
create policy "Products insert for authenticated only"
  on products for insert
  with check (auth.role() = 'authenticated');

create policy "Products update for authenticated only"
  on products for update
  using (auth.role() = 'authenticated');

-- Customers: anyone can insert (checkout form)
create policy "Customers can be inserted by anyone"
  on customers for insert
  with check (true);

-- Customers: read own data by email
create policy "Customers can read own data"
  on customers for select
  using (email = current_setting('request.jwt.claims', true)::json->>'email' or auth.role() = 'authenticated');

-- Orders: anyone can insert (checkout form)
create policy "Orders can be inserted by anyone"
  on orders for insert
  with check (true);

-- Orders: read own orders
create policy "Orders readable by matching user_email"
  on orders for select
  using (user_email = current_setting('request.jwt.claims', true)::json->>'email' or auth.role() = 'authenticated');

-- Newsletter: anyone can subscribe
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

-- Profiles: users can upsert and read their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);
