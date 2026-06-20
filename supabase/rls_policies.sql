-- ==========================================================================
-- supabase/rls_policies.sql
-- Run after schema.sql. This is what actually protects your data — the
-- anon key shipped in config.js is public, but RLS limits what it can do.
-- ==========================================================================

alter table public.users enable row level security;
alter table public.spots enable row level security;
alter table public.reviews enable row level security;
alter table public.saves enable row level security;
alter table public.reports enable row level security;
alter table public.rate_limits enable row level security;

-- ---- users ----------------------------------------------------------
-- Username/avatar are treated as public profile info (needed for the
-- live "username taken?" check and for showing avatars in the navbar).
create policy "users are publicly readable"
  on public.users for select
  using (true);

create policy "a user can create only their own profile row"
  on public.users for insert
  with check (auth.uid() = id);

create policy "a user can edit only their own profile row"
  on public.users for update
  using (auth.uid() = id);

-- ---- spots ------------------------------------------------------------
create policy "spots are publicly readable"
  on public.spots for select
  using (true);

create policy "logged-in users can post spots"
  on public.spots for insert
  with check (auth.uid() = owner_id);

create policy "only the owner can edit their spot"
  on public.spots for update
  using (auth.uid() = owner_id);

create policy "only the owner can delete their spot"
  on public.spots for delete
  using (auth.uid() = owner_id);

-- ---- reviews ------------------------------------------------------------
-- No user_id column exists on this table at all, so there's nothing to
-- restrict at the row level for reads — anonymity is structural, not a
-- policy. Any logged-in user may post a review; no one may edit/delete
-- another person's, and there is intentionally no update/delete policy
-- for regular users at all (reviews are permanent once posted).
create policy "reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "logged-in users can post reviews"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');

-- ---- saves ------------------------------------------------------------
-- Private to each user — no one else should see what you've saved.
create policy "a user can see only their own saves"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "a user can save spots for themselves"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "a user can remove their own saves"
  on public.saves for delete
  using (auth.uid() = user_id);

-- ---- reports ------------------------------------------------------------
-- Write-only for normal users: there is deliberately NO select policy
-- here, so the anon-key client can never read reports back, regardless
-- of who's logged in. Review them in the Supabase dashboard's Table
-- Editor (which uses the service-role key and bypasses RLS) or build a
-- separate admin tool authenticated with the service-role key.
create policy "logged-in users can file reports"
  on public.reports for insert
  with check (auth.role() = 'authenticated');

-- ---- rate_limits ------------------------------------------------------
-- No policies at all = fully locked to the anon/authenticated roles.
-- Only the Edge Function (using the service-role key, which bypasses
-- RLS entirely) can read or write this table.
