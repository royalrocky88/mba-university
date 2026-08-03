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

-- Form submissions: MBA applications and contact enquiries.
--
-- Deliberately NOT one of the content tables above. Those are world-readable and
-- admin-writable; this one is the exact inverse — anybody may write to it, only a
-- signed-in administrator may read it. See the policy block below.
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('application', 'contact')),
  reference text not null unique,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  data jsonb not null,
  -- Guards against a bot filling the table with junk. All three are cheap and
  -- immutable, so they are valid in a check constraint.
  constraint submissions_reference_format check (reference ~ '^[A-Z]{3}-[A-Z0-9-]{4,20}$'),
  constraint submissions_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint submissions_data_has_email check (data ? 'email'),
  constraint submissions_data_size check (length(data::text) <= 8192)
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

-- The inbox is always read newest-first, and filtered by status.
create index if not exists submissions_created_idx on public.submissions (created_at desc);
create index if not exists submissions_status_idx on public.submissions (status);

-- -----------------------------------------------------------------------------
-- Row-level security
--
-- Anyone may read (this is a public website). Only an authenticated user may
-- write. This is the real security boundary — the React route guard is only a
-- convenience for the browser.
--
-- `submissions` is deliberately absent from the loop below and gets its own
-- policies further down, because a public read policy on it would leak the
-- contact details of every applicant.
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
-- Row-level security — submissions
--
-- Write-only for the public, read-only for the administrator:
--   • a visitor with the anon key may INSERT a new submission and nothing else,
--   • only a signed-in administrator may SELECT, UPDATE or DELETE.
--
-- Because anon has no select policy, the insert in `src/lib/forms.ts` must not
-- chain `.select()` — asking for the row back would be rejected.
-- -----------------------------------------------------------------------------

alter table public.submissions enable row level security;

drop policy if exists "public insert submissions" on public.submissions;
create policy "public insert submissions"
  on public.submissions for insert
  to anon, authenticated
  with check (status = 'new');

drop policy if exists "authenticated read submissions" on public.submissions;
create policy "authenticated read submissions"
  on public.submissions for select
  to authenticated
  using (true);

drop policy if exists "authenticated update submissions" on public.submissions;
create policy "authenticated update submissions"
  on public.submissions for update
  to authenticated
  using (true) with check (true);

drop policy if exists "authenticated delete submissions" on public.submissions;
create policy "authenticated delete submissions"
  on public.submissions for delete
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- Administrator roles
--
-- Two levels:
--   • superadmin — every section, plus site settings, theme, enquiries and the
--     administrator list itself.
--   • admin      — the content behind the navbar (programmes, faculty, news,
--                  placements, campus, about) and nothing else.
--
-- The split is enforced here, in row-level security, not in React. Hiding a
-- button only hides the button: an admin holding the anon key can still call
-- PostgREST directly, so the database has to be the thing that says no.
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'admin' check (role in ('superadmin', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

/*
 * The caller's role, or null when signed out.
 *
 * SECURITY DEFINER so it can read `profiles` without recursing through that
 * table's own policies — a policy that calls a function that reads the table
 * the policy protects would deadlock into infinite recursion otherwise.
 */
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() = 'superadmin', false)
$$;

/** True for either role — i.e. anybody who may edit navbar content. */
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('superadmin', 'admin')
$$;

-- Everyone signed in may read the administrator list (the admin UI shows it);
-- only a superadmin may change it, and nobody may edit their own role.
drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles"
  on public.profiles for select to authenticated using (true);

drop policy if exists "superadmin write profiles" on public.profiles;
create policy "superadmin write profiles"
  on public.profiles for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Content collections: either role may write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'programs', 'faculty', 'news', 'testimonials', 'recruiters',
    'placement_trend', 'facilities', 'gallery', 'faqs', 'leadership'
  ]
  loop
    execute format('drop policy if exists "authenticated write %s" on public.%I', t, t);
    execute format(
      'create policy "editor write %s" on public.%I for all
         to authenticated using (public.is_editor()) with check (public.is_editor())', t, t
    );
  end loop;
end $$;

-- Site settings are superadmin-only: they carry the institution's name, address
-- and contact details, which is not navbar content.
drop policy if exists "authenticated write site_settings" on public.site_settings;
drop policy if exists "superadmin write site_settings" on public.site_settings;
create policy "superadmin write site_settings"
  on public.site_settings for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Enquiries and applications hold applicant contact details. Superadmin only.
drop policy if exists "authenticated read submissions" on public.submissions;
create policy "superadmin read submissions"
  on public.submissions for select to authenticated using (public.is_superadmin());

drop policy if exists "authenticated update submissions" on public.submissions;
create policy "superadmin update submissions"
  on public.submissions for update
  to authenticated using (public.is_superadmin()) with check (public.is_superadmin());

drop policy if exists "authenticated delete submissions" on public.submissions;
create policy "superadmin delete submissions"
  on public.submissions for delete to authenticated using (public.is_superadmin());

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
--   3. Form submissions arrive at /admin/submissions. Nothing notifies you of a
--      new one — add a Database Webhook on insert into public.submissions if you
--      want email or Slack alerts.
-- =============================================================================
