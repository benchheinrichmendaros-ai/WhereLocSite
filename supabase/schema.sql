-- ==========================================================================
-- supabase/schema.sql
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New
-- query) on a fresh project, BEFORE rls_policies.sql and storage.sql.
-- ==========================================================================

-- Profile row, separate from Supabase's built-in auth.users. One row per
-- account, created during the username-selection step (not at signup).
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('study','date','relax','other')),
  age_tag text not null default 'all' check (age_tag in ('all','18+','21+')),
  lat double precision not null,
  lng double precision not null,
  image_urls text[] not null default '{}',
  -- Powers the "Staff Pick" / "Starter Spot" badge described in the brief
  -- so early seeded content is never mistaken for a real student post.
  is_staff_pick boolean not null default false,
  created_at timestamptz not null default now()
);

create index spots_category_idx on public.spots (category);
create index spots_created_at_idx on public.spots (created_at desc);

-- No user_id column on purpose: review content must never be traceable
-- back to an account, even by an admin querying the database directly.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index reviews_spot_id_idx on public.reviews (spot_id);

create table public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, spot_id)
);
create index saves_user_id_idx on public.saves (user_id);

-- Visible only to an admin querying with the service-role key (see
-- rls_policies.sql) — never exposed through the anon-key client app.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Written only by the rate-limit Edge Function (service-role key), never
-- by the browser client directly. One row per submission attempt.
create table public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ip text,
  action text not null,
  created_at timestamptz not null default now()
);
create index rate_limits_lookup_idx on public.rate_limits (user_id, action, created_at);
create index rate_limits_ip_idx on public.rate_limits (ip, action, created_at);
