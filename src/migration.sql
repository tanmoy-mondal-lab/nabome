-- =============================================
-- নবME Database Migration
-- Run this in Supabase SQL Editor after deploying the new code.
-- All statements use IF NOT EXISTS / IF EXISTS so it's safe to re-run.
-- =============================================

-- ─── CUSTOMERS: add gender column ──────────
alter table customers add column if not exists gender text;

-- ─── ADDRESSES: add missing columns ────────
alter table addresses add column if not exists district text;
alter table addresses add column if not exists email text;
-- The code references `address` but the schema has `line1`.
-- Add `address` as a virtual column or rename line1 → address.
-- Option A: Rename line1 to address
-- alter table addresses rename column line1 to address;
-- Option B: Keep both (preferred to avoid breaking existing data + other code)
alter table addresses add column if not exists address text;
-- Copy existing line1 data into address
update addresses set address = line1 where address is null and line1 is not null;
-- Drop line2 if unused (safe — it's nullable, this is optional)
-- alter table addresses drop column if exists line2;

-- ─── ORDERS: add delivery detail columns ───
alter table orders add column if not exists delivery_name text;
alter table orders add column if not exists delivery_phone text;
alter table orders add column if not exists delivery_email text;
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_district text;
alter table orders add column if not exists delivery_city text;
alter table orders add column if not exists delivery_state text;
alter table orders add column if not exists delivery_pincode text;

-- ─── LOGIN OTPS (for serverless API endpoints) ──
create table if not exists login_otps (
  id           uuid primary key default gen_random_uuid(),
  identifier   text not null,          -- phone or email
  otp          text not null,
  is_used      boolean default false,
  retry_count  integer default 0,
  expires_at   timestamptz not null,
  created_at   timestamptz default now()
);

create index if not exists idx_login_otps_identifier on login_otps(identifier);
create index if not exists idx_login_otps_expires on login_otps(expires_at);

-- ─── RLS: allow public insert on login_otps (for API endpoint) ──
alter table login_otps enable row level security;
drop policy if exists "Anyone can insert OTP" on login_otps;
create policy "Anyone can insert OTP" on login_otps for insert with check (true);
drop policy if exists "Anyone can read OTP" on login_otps;
create policy "Anyone can read OTP" on login_otps for select using (true);

-- ─── RLS: update customers/addresses policies to allow service_role access ──
-- The server-side API endpoints use SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS automatically. No changes needed for that.

-- ─── RLS: allow customers to read own data by session ──
drop policy if exists "Customers read own" on customers;
create policy "Customers read own" on customers
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- ─── RLS: allow address operations for service_role ──
drop policy if exists "Addresses read own" on addresses;
create policy "Addresses read own" on addresses
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "Addresses insert anyone" on addresses;
create policy "Addresses insert anyone" on addresses
  for insert with check (true);

drop policy if exists "Addresses update own" on addresses;
create policy "Addresses update own" on addresses
  for update using (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "Addresses delete own" on addresses;
create policy "Addresses delete own" on addresses
  for delete using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- ─── RLS: allow order operations for service_role ──
drop policy if exists "Orders insert anyone" on orders;
create policy "Orders insert anyone" on orders
  for insert with check (true);

drop policy if exists "Orders read own" on orders;
create policy "Orders read own" on orders
  for select using (
    auth.role() = 'authenticated'
    or auth.role() = 'service_role'
    or user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

drop policy if exists "Orders update for authed" on orders;
create policy "Orders update for authed" on orders
  for update using (auth.role() = 'authenticated' or auth.role() = 'service_role');
