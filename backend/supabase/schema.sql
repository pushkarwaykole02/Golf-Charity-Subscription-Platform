-- Supabase schema for Golf Charity Subscription Platform
-- Apply in Supabase SQL editor (or via migration tool).

-- PROFILES: app-level user details linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SCORES: store multiple but backend keeps last 5; RLS also limits read/write to owner
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null check (score between 1 and 45),
  date timestamptz not null default now()
);
create index if not exists scores_user_date_idx on public.scores(user_id, date desc);

-- SUBSCRIPTIONS: mock stripe state
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null,
  status text not null,
  renewal_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHARITIES + user selection
create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_charities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  charity_id uuid not null references public.charities(id) on delete restrict,
  percentage int not null check (percentage between 10 and 100),
  created_at timestamptz not null default now()
);

-- DRAWS: month is YYYY-MM
create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  month text unique not null,
  numbers int[] not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- WINNERS: claims + verification
create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draw_id uuid not null references public.draws(id) on delete cascade,
  match_type int not null check (match_type in (3,4,5)),
  status text not null default 'pending', -- pending|approved|rejected
  proof_url text,
  created_at timestamptz not null default now(),
  unique(user_id, draw_id)
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.scores enable row level security;
alter table public.subscriptions enable row level security;
alter table public.charities enable row level security;
alter table public.user_charities enable row level security;
alter table public.draws enable row level security;
alter table public.winners enable row level security;

-- Helper: "is admin" check via profiles
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- PROFILES policies
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- SCORES policies
drop policy if exists "scores_rw_own" on public.scores;
create policy "scores_rw_own" on public.scores
  for all
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- SUBSCRIPTIONS policies
drop policy if exists "subscriptions_rw_own" on public.subscriptions;
create policy "subscriptions_rw_own" on public.subscriptions
  for all
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- CHARITIES policies (read for all authed users; admin for write)
drop policy if exists "charities_read" on public.charities;
create policy "charities_read" on public.charities
  for select using (auth.role() = 'authenticated');

drop policy if exists "charities_admin_write" on public.charities;
create policy "charities_admin_write" on public.charities
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- USER_CHARITIES policies
drop policy if exists "user_charities_rw_own" on public.user_charities;
create policy "user_charities_rw_own" on public.user_charities
  for all
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- DRAWS policies: read for all; admin write
drop policy if exists "draws_read" on public.draws;
create policy "draws_read" on public.draws
  for select using (auth.role() = 'authenticated');

drop policy if exists "draws_admin_write" on public.draws;
create policy "draws_admin_write" on public.draws
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- WINNERS policies
drop policy if exists "winners_read_own" on public.winners;
create policy "winners_read_own" on public.winners
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "winners_write_own" on public.winners;
create policy "winners_write_own" on public.winners
  for insert with check (auth.uid() = user_id);

drop policy if exists "winners_update_own" on public.winners;
create policy "winners_update_own" on public.winners
  for update
  using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

