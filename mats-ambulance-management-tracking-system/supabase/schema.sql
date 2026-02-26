create extension if not exists pgcrypto;

create table if not exists public.ambulances (
  id text primary key,
  driver_name text not null,
  driver_phone text not null,
  location jsonb not null,
  status text not null,
  last_updated timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  ambulance_id text references public.ambulances(id),
  patient_name text not null,
  patient_phone text not null,
  pickup_location jsonb not null,
  hospital_name text not null,
  hospital_location jsonb not null,
  status text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  priority text not null
);

create index if not exists trips_ambulance_id_idx on public.trips(ambulance_id);
create index if not exists trips_status_idx on public.trips(status);

alter table public.ambulances enable row level security;
alter table public.trips enable row level security;

create policy "Allow anon read/write ambulances"
  on public.ambulances
  for all
  to anon
  using (true)
  with check (true);

create policy "Allow anon read/write trips"
  on public.trips
  for all
  to anon
  using (true)
  with check (true);
