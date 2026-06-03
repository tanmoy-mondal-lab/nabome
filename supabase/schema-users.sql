-- =============================================
-- নবME — Supabase SQL: Users & Addresses Schema
-- Run this in Supabase SQL Editor (safe to re-run)
-- =============================================

-- ─── USERS (synced with auth.users via trigger) ──
create table if not exists users (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  gender        text check (gender in ('Male', 'Female', 'Other')),
  role          text not null default 'customer'
                check (role in ('customer', 'vendor', 'admin', 'super_admin')),
  profile_image text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── ADDRESSES ─────────────────────────────
create table if not exists addresses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
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

create index if not exists idx_addresses_user_id on addresses(user_id);

-- ─── ROW LEVEL SECURITY ────────────────────
alter table users enable row level security;
alter table addresses enable row level security;

-- ─── DROP EXISTING POLICIES ────────────────
do $$ begin
  drop policy if exists "Users read own" on users;
  drop policy if exists "Users insert own" on users;
  drop policy if exists "Users update own" on users;
  drop policy if exists "Users delete own" on users;
  drop policy if exists "Addresses read own" on addresses;
  drop policy if exists "Addresses insert own" on addresses;
  drop policy if exists "Addresses update own" on addresses;
  drop policy if exists "Addresses delete own" on addresses;
end $$;

-- ─── USERS POLICIES ────────────────────────
create policy "Users read own"
  on users for select
  using (auth.uid() = id);

create policy "Users insert own"
  on users for insert
  with check (auth.uid() = id);

create policy "Users update own"
  on users for update
  using (auth.uid() = id);

create policy "Users delete own"
  on users for delete
  using (auth.uid() = id);

-- ─── ADDRESSES POLICIES ────────────────────
create policy "Addresses read own"
  on addresses for select
  using (auth.uid() = user_id);

create policy "Addresses insert own"
  on addresses for insert
  with check (auth.uid() = user_id);

create policy "Addresses update own"
  on addresses for update
  using (auth.uid() = user_id);

create policy "Addresses delete own"
  on addresses for delete
  using (auth.uid() = user_id);
