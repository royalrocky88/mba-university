-- =============================================================================
-- Meridian School of Business — database schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It is idempotent: running it again is harmless.
--
-- Design note: every content table is (id, sort_order, updated_at, data jsonb).
-- Keeping the record itself in a single jsonb column is what lets the admin
-- panel add or rename a field on a programme without anyone writing a migration.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.recruiters (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.placement_trend (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

create table if not exists public.leadership (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  data jsonb not null
);

-- Single-row settings table.
create table if not exists public.site_settings (
  id integer primary key default 1,
  updated_at timestamptz not null default now(),
  data jsonb not null,
  constraint site_settings_singleton check (id = 1)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists programs_sort_idx on public.programs (sort_order);
create index if not exists faculty_sort_idx on public.faculty (sort_order);
create index if not exists news_sort_idx on public.news (sort_order);
create index if not exists testimonials_sort_idx on public.testimonials (sort_order);
create index if not exists recruiters_sort_idx on public.recruiters (sort_order);
create index if not exists placement_trend_sort_idx on public.placement_trend (sort_order);
create index if not exists facilities_sort_idx on public.facilities (sort_order);
create index if not exists gallery_sort_idx on public.gallery (sort_order);
create index if not exists faqs_sort_idx on public.faqs (sort_order);
create index if not exists leadership_sort_idx on public.leadership (sort_order);

-- Slugs must be unique or one of the two pages becomes unreachable. The admin
-- panel also checks this, but the database is the authority.
create unique index if not exists programs_slug_key on public.programs ((data ->> 'slug'));
create unique index if not exists faculty_slug_key on public.faculty ((data ->> 'slug'));
create unique index if not exists news_slug_key on public.news ((data ->> 'slug'));

-- -----------------------------------------------------------------------------
-- Row-level security
--
-- Anyone may read (this is a public website). Only an authenticated user may
-- write. This is the real security boundary — the React route guard is only a
-- convenience for the browser.
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'programs', 'faculty', 'news', 'testimonials', 'recruiters',
    'placement_trend', 'facilities', 'gallery', 'faqs', 'leadership',
    'site_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public read %s" on public.%I', t, t);
    execute format(
      'create policy "public read %s" on public.%I for select using (true)', t, t
    );

    execute format('drop policy if exists "authenticated write %s" on public.%I', t, t);
    execute format(
      'create policy "authenticated write %s" on public.%I for all
         to authenticated using (true) with check (true)', t, t
    );
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Storage bucket for admin-uploaded images
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read media" on storage.objects;
create policy "public read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "authenticated upload media" on storage.objects;
create policy "authenticated upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "authenticated update media" on storage.objects;
create policy "authenticated update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

drop policy if exists "authenticated delete media" on storage.objects;
create policy "authenticated delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- =============================================================================
-- Done.
--
-- Next steps:
--   1. Authentication → Users → "Add user" to create your administrator login.
--      (Turn OFF "Enable sign-ups" under Authentication → Providers → Email, so
--      nobody can register themselves.)
--   2. Sign in at /admin and press "Seed database" to load the starting content.
-- =============================================================================
