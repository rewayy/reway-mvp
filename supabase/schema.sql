-- Reway MVP database schema for Supabase/PostgreSQL.
-- Run this in Supabase SQL Editor before using the application.

create extension if not exists pgcrypto;

create type public.user_role as enum ('seller','recycler','admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  role public.user_role not null default 'seller',
  phone text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  category text not null,
  material_type text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null default 'kg',
  condition text,
  location text not null,
  pickup_date date,
  pickup_time time,
  description text,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','SOLD','CANCELLED','EXPIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  recycler_id uuid not null references public.profiles(id) on delete restrict,
  price_per_unit numeric not null check (price_per_unit >= 0),
  pickup_included boolean not null default true,
  pickup_cost numeric not null default 0 check (pickup_cost >= 0),
  validity_days integer not null default 7 check (validity_days > 0),
  notes text,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','ACCEPTED','REJECTED','WITHDRAWN','EXPIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  quote_id uuid not null references public.quotes(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  recycler_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'ORDER_CONFIRMED' check (status in ('ORDER_CONFIRMED','PICKUP_SCHEDULED','PICKED_UP','IN_TRANSIT','RECEIVED','COMPLETED','CANCELLED','DISPUTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.status_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint status_event_parent check (listing_id is not null or order_id is not null)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  document_type text,
  created_at timestamptz not null default now()
);

create index if not exists listings_seller_idx on public.listings(seller_id);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists quotes_listing_idx on public.quotes(listing_id);
create index if not exists quotes_recycler_idx on public.quotes(recycler_id);
create index if not exists orders_seller_idx on public.orders(seller_id);
create index if not exists orders_recycler_idx on public.orders(recycler_id);
create index if not exists status_events_order_idx on public.status_events(order_id);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
alter table public.status_events enable row level security;
alter table public.notifications enable row level security;
alter table public.documents enable row level security;

-- Profiles: users can read/update their own profile; published marketplace cards can read limited profile fields through the join.
create policy "profiles own select" on public.profiles for select using (auth.uid() = id or role = 'admin');
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id or role = 'admin') with check (auth.uid() = id or role = 'admin');

-- Listings: sellers manage their own; authenticated users can discover published listings.
create policy "listings published read" on public.listings for select to authenticated using (status = 'PUBLISHED' or seller_id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "seller creates listing" on public.listings for insert to authenticated with check (seller_id = auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='seller'));
create policy "seller updates listing" on public.listings for update to authenticated using (seller_id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (seller_id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- Quotes: recycler creates/reads own; seller reads quotes on own listings; admin reads all.
create policy "quotes relevant read" on public.quotes for select to authenticated using (
  recycler_id = auth.uid() or
  exists(select 1 from public.listings l where l.id=listing_id and l.seller_id=auth.uid()) or
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);
create policy "recycler creates quote" on public.quotes for insert to authenticated with check (recycler_id = auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='recycler'));
create policy "recycler updates quote" on public.quotes for update to authenticated using (recycler_id = auth.uid() or exists(select 1 from public.listings l where l.id=listing_id and l.seller_id=auth.uid()) or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (recycler_id = auth.uid() or exists(select 1 from public.listings l where l.id=listing_id and l.seller_id=auth.uid()) or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- Orders: only seller/recycler/admin participants can access.
create policy "orders participants read" on public.orders for select to authenticated using (seller_id=auth.uid() or recycler_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "seller creates order" on public.orders for insert to authenticated with check (seller_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "order participants update" on public.orders for update to authenticated using (seller_id=auth.uid() or recycler_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (seller_id=auth.uid() or recycler_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

create policy "status events participants read" on public.status_events for select to authenticated using (
  exists(select 1 from public.orders o where o.id=order_id and (o.seller_id=auth.uid() or o.recycler_id=auth.uid())) or
  exists(select 1 from public.listings l where l.id=listing_id and l.seller_id=auth.uid()) or
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
);
create policy "status events authenticated insert" on public.status_events for insert to authenticated with check (created_by = auth.uid() or created_by is null);

create policy "notifications own read" on public.notifications for select to authenticated using (user_id=auth.uid());
create policy "documents owner read" on public.documents for select to authenticated using (owner_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "documents owner insert" on public.documents for insert to authenticated with check (owner_id=auth.uid());

-- Create profile automatically when a user signs up. Role is constrained to seller/recycler from metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'company_name',''),
    case when new.raw_user_meta_data->>'role' = 'recycler' then 'recycler'::public.user_role else 'seller'::public.user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
