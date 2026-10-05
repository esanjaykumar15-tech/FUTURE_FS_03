-- Row Level Security. The Express API uses the service-role key (bypasses RLS)
-- and enforces admin checks itself; these policies protect any direct
-- browser access made with the public anon key.
alter table public.profiles     enable row level security;
alter table public.menu_items   enable row level security;
alter table public.reservations enable row level security;
alter table public.enquiries    enable row level security;

-- profiles: a user may read ONLY their own row. No client writes at all,
-- so nobody can assign themselves a role.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (user_id = auth.uid());

-- menu_items: public can read available items; admins can do everything.
create policy "menu_public_read" on public.menu_items
  for select to anon, authenticated using (available = true);
create policy "menu_admin_all" on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reservations / enquiries: no public read or write via Supabase directly.
-- Public submissions go through the validated, rate-limited API.
create policy "reservations_admin_all" on public.reservations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "enquiries_admin_all" on public.enquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Defense in depth: strip default table privileges from anon.
revoke all on public.profiles, public.reservations, public.enquiries from anon;
revoke insert, update, delete on public.menu_items from anon;
