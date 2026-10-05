-- BrewSpace Café — initial schema
create extension if not exists "pgcrypto";

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin')),
  display_name text check (char_length(display_name) <= 80)
);

-- Auto-create a NON-privileged profile for every new auth user.
-- Role is always 'customer'; promotion happens only via SQL by a project owner.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, role, display_name)
  values (new.id, 'customer', null);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by RLS policies
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- menu_items ----------
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  category text not null check (category in
    ('Hot Coffee','Cold Drinks','Tea','Snacks','Desserts')),
  price numeric(10,2) not null check (price >= 0 and price <= 100000),
  image_url text check (image_url is null or image_url ~* '^https?://'),
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_category_idx on public.menu_items (category);
create index menu_items_available_idx on public.menu_items (available);
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------- reservations ----------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (phone ~ '^[0-9+()\-\s]{7,20}$'),
  booking_date date not null,
  booking_time time not null,
  party_size int not null check (party_size between 1 and 20),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now(),
  -- Blocks exact duplicate submissions (double-clicks / retries)
  constraint reservations_no_duplicate unique (phone, booking_date, booking_time)
);
create index reservations_date_idx on public.reservations (booking_date);
create index reservations_status_idx on public.reservations (status);

-- ---------- enquiries ----------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  phone text check (phone is null or phone ~ '^[0-9+()\-\s]{7,20}$'),
  message text not null check (char_length(message) between 5 and 2000),
  status text not null default 'new' check (status in ('new','read','resolved')),
  created_at timestamptz not null default now()
);
create index enquiries_status_idx on public.enquiries (status);
create index enquiries_created_idx on public.enquiries (created_at desc);
