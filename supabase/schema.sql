create extension if not exists pgcrypto;

create table if not exists public.fund_dataset_meta (
  dataset text primary key,
  source_name text not null,
  source_url text not null,
  std_date date not null,
  previous_std_date date,
  month_ago_std_date date,
  fund_count integer not null default 0,
  insurer_count integer not null default 0,
  insurers text[] not null default '{}',
  notice text,
  fetched_at timestamptz not null default now()
);

create table if not exists public.fund_snapshots (
  std_date date not null,
  fund_id text not null,
  member_cd text,
  fund_cd text,
  insurer text not null,
  name text not null,
  setting_date date,
  nav numeric,
  day numeric,
  month numeric,
  year numeric,
  three_year_rate numeric,
  five_year_rate numeric,
  cumulative_rate numeric,
  big_type text,
  small_type text,
  category text,
  net_assets numeric,
  source text,
  source_url text,
  raw jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  primary key (std_date, fund_id)
);

create index if not exists fund_snapshots_insurer_idx on public.fund_snapshots (std_date, insurer);
create index if not exists fund_snapshots_name_idx on public.fund_snapshots using gin (to_tsvector('simple', coalesce(name, '')));

create table if not exists public.variable_products (
  id uuid primary key default gen_random_uuid(),
  insurer text not null,
  product text not null,
  insurance_type text,
  product_type text,
  sale_start_date date,
  sale_end_date date,
  fund_count integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (insurer, product, sale_start_date)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text,
  insurer text not null,
  product text not null,
  base_date date not null,
  base_value numeric not null,
  actual_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_allocations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  fund_id text not null,
  weight numeric not null check (weight >= 0 and weight <= 1),
  created_at timestamptz not null default now()
);

create index if not exists client_allocations_client_id_idx on public.client_allocations (client_id);

create table if not exists public.client_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_date date not null,
  reserve_value numeric not null,
  change text not null,
  reason text,
  result text,
  created_at timestamptz not null default now()
);

create index if not exists client_history_client_id_idx on public.client_history (client_id, event_date desc);

alter table public.fund_dataset_meta enable row level security;
alter table public.fund_snapshots enable row level security;
alter table public.variable_products enable row level security;
alter table public.clients enable row level security;
alter table public.client_allocations enable row level security;
alter table public.client_history enable row level security;

drop policy if exists "public read fund meta" on public.fund_dataset_meta;
create policy "public read fund meta"
on public.fund_dataset_meta for select
using (true);

drop policy if exists "public read fund snapshots" on public.fund_snapshots;
create policy "public read fund snapshots"
on public.fund_snapshots for select
using (true);

drop policy if exists "public read variable products" on public.variable_products;
create policy "public read variable products"
on public.variable_products for select
using (true);
