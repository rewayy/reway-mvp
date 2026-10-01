-- Reway MVP database schema for Supabase/PostgreSQL.
-- Canonical schema for a fresh Reway database.
-- For an existing live database, use a migration instead of rerunning this whole file.

create extension if not exists pgcrypto;

-- ============================================================
-- TYPES
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role'
      and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('seller', 'recycler', 'admin');
  end if;
end
$$;

-- ============================================================
-- TABLES
-- ============================================================

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

  category text not null
    check (
      category in (
        'E_WASTE',
        'BATTERY_WASTE',
        'CAR_SCRAP',
        'E_RICKSHAW_SCRAP'
      )
    ),

  material_type text not null,

  quantity numeric not null check (quantity > 0),
  unit text not null default 'kg',

  condition text,
  location text not null,

  pickup_date date,
  pickup_time time,

  description text,

  contact_name text,
  contact_phone text,

  status text not null default 'DRAFT'
    check (
      status in (
        'DRAFT',
        'PUBLISHED',
        'SOLD',
        'CANCELLED',
        'EXPIRED'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Itemized waste within a listing.
create table if not exists public.listing_items (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  item_name text not null,
  quantity numeric check (quantity is null or quantity > 0),
  unit text not null default 'units',
  created_at timestamptz not null default now()
);

-- Metadata for listing photos. Actual image files are stored in Supabase Storage.
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
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
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED','ACCEPTED','REJECTED','WITHDRAWN','EXPIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  quote_id uuid not null references public.quotes(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  recycler_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'ORDER_CONFIRMED'
    check (
      status in (
        'ORDER_CONFIRMED',
        'PICKUP_SCHEDULED',
        'PICKED_UP',
        'IN_TRANSIT',
        'RECEIVED',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED'
      )
    ),
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
  constraint status_event_parent
    check (listing_id is not null or order_id is not null)
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

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists listings_seller_idx
  on public.listings(seller_id);

create index if not exists listings_status_idx
  on public.listings(status);

create index if not exists listings_category_status_idx
  on public.listings(category, status);

create index if not exists listing_items_listing_idx
  on public.listing_items(listing_id);

create index if not exists listing_images_listing_idx
  on public.listing_images(listing_id);

create index if not exists quotes_listing_idx
  on public.quotes(listing_id);

create index if not exists quotes_recycler_idx
  on public.quotes(recycler_id);

create index if not exists orders_seller_idx
  on public.orders(seller_id);

create index if not exists orders_recycler_idx
  on public.orders(recycler_id);

create index if not exists status_events_order_idx
  on public.status_events(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_items enable row level security;
alter table public.listing_images enable row level security;
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
alter table public.status_events enable row level security;
alter table public.notifications enable row level security;
alter table public.documents enable row level security;

-- ============================================================
-- PROFILE POLICIES
-- Profiles remain private: own profile or admin only.
-- ============================================================

drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or role = 'admin'
);

drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or role = 'admin'
)
with check (
  auth.uid() = id
  or role = 'admin'
);

-- ============================================================
-- LISTING POLICIES
-- Published listings are public.
-- Sellers can also see/manage their own non-published listings.
-- ============================================================

drop policy if exists "listings published read" on public.listings;
create policy "listings published read"
on public.listings
for select
to anon, authenticated
using (
  status = 'PUBLISHED'
  or seller_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "seller creates listing" on public.listings;
create policy "seller creates listing"
on public.listings
for insert
to authenticated
with check (
  seller_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'seller'
  )
);

drop policy if exists "seller updates listing" on public.listings;
create policy "seller updates listing"
on public.listings
for update
to authenticated
using (
  seller_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  seller_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- ============================================================
-- LISTING ITEM POLICIES
-- ============================================================

drop policy if exists "listing items read" on public.listing_items;
create policy "listing items read"
on public.listing_items
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_items.listing_id
      and (
        l.status = 'PUBLISHED'
        or l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "seller inserts listing items" on public.listing_items;
create policy "seller inserts listing items"
on public.listing_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_items.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "seller updates listing items" on public.listing_items;
create policy "seller updates listing items"
on public.listing_items
for update
to authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_items.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_items.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "seller deletes listing items" on public.listing_items;
create policy "seller deletes listing items"
on public.listing_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_items.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

-- ============================================================
-- LISTING IMAGE METADATA POLICIES
-- ============================================================

drop policy if exists "listing images read" on public.listing_images;
create policy "listing images read"
on public.listing_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.status = 'PUBLISHED'
        or l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "seller inserts listing images" on public.listing_images;
create policy "seller inserts listing images"
on public.listing_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "seller updates listing images" on public.listing_images;
create policy "seller updates listing images"
on public.listing_images
for update
to authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

drop policy if exists "seller deletes listing images" on public.listing_images;
create policy "seller deletes listing images"
on public.listing_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and (
        l.seller_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
  )
);

-- ============================================================
-- QUOTE POLICIES
-- ============================================================

drop policy if exists "quotes relevant read" on public.quotes;
create policy "quotes relevant read"
on public.quotes
for select
to authenticated
using (
  recycler_id = auth.uid()
  or exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.seller_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "recycler creates quote" on public.quotes;
create policy "recycler creates quote"
on public.quotes
for insert
to authenticated
with check (
  recycler_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'recycler'
  )
);

drop policy if exists "recycler updates quote" on public.quotes;
create policy "recycler updates quote"
on public.quotes
for update
to authenticated
using (
  recycler_id = auth.uid()
  or exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.seller_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  recycler_id = auth.uid()
  or exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.seller_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- ============================================================
-- ORDER POLICIES
-- ============================================================

drop policy if exists "orders participants read" on public.orders;
create policy "orders participants read"
on public.orders
for select
to authenticated
using (
  seller_id = auth.uid()
  or recycler_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "seller creates order" on public.orders;
create policy "seller creates order"
on public.orders
for insert
to authenticated
with check (
  seller_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "order participants update" on public.orders;
create policy "order participants update"
on public.orders
for update
to authenticated
using (
  seller_id = auth.uid()
  or recycler_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  seller_id = auth.uid()
  or recycler_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- ============================================================
-- STATUS / NOTIFICATION / DOCUMENT POLICIES
-- ============================================================

drop policy if exists "status events participants read" on public.status_events;
create policy "status events participants read"
on public.status_events
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (
        o.seller_id = auth.uid()
        or o.recycler_id = auth.uid()
      )
  )
  or exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.seller_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "status events authenticated insert" on public.status_events;
create policy "status events authenticated insert"
on public.status_events
for insert
to authenticated
with check (
  created_by = auth.uid()
  or created_by is null
);

drop policy if exists "notifications own read" on public.notifications;
create policy "notifications own read"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "documents owner read" on public.documents;
create policy "documents owner read"
on public.documents
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "documents owner insert" on public.documents;
create policy "documents owner insert"
on public.documents
for insert
to authenticated
with check (owner_id = auth.uid());

-- ============================================================
-- GRANTS
-- ============================================================

grant select on public.listings to anon;
grant select on public.listing_items to anon;
grant select on public.listing_images to anon;

grant select, insert, update, delete
on public.listing_items
to authenticated;

grant select, insert, update, delete
on public.listing_images
to authenticated;

-- ============================================================
-- STORAGE
-- Creates the public listing-images bucket.
-- Images are public to read, while writes are restricted by RLS.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "seller uploads listing images" on storage.objects;
create policy "seller uploads listing images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "seller updates listing image files" on storage.objects;
create policy "seller updates listing image files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
);

drop policy if exists "seller deletes listing image files" on storage.objects;
create policy "seller deletes listing image files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-images'
  and owner_id = auth.uid()::text
);

-- ============================================================
-- AUTH PROFILE TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    company_name,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company_name', ''),
    case
      when new.raw_user_meta_data->>'role' = 'recycler'
        then 'recycler'::public.user_role
      else 'seller'::public.user_role
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
