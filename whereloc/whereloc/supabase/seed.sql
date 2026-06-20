-- ==========================================================================
-- supabase/seed.sql (optional)
-- Run this AFTER you've signed up through the actual app once (so a real
-- row exists in public.users — spots.owner_id has a foreign key to it).
--
-- 1. Sign up + finish username setup in the app.
-- 2. In the SQL Editor, run: select id, username from public.users;
-- 3. Copy your id and paste it in place of 'YOUR-USER-ID-HERE' below.
-- 4. Adjust lat/lng to real coordinates on your campus.
-- 5. Run this file. These spots will show the "Staff Pick" badge.
-- ==========================================================================

insert into public.spots (owner_id, title, description, category, age_tag, lat, lng, image_urls, is_staff_pick)
values
  ('YOUR-USER-ID-HERE', 'Top-floor library reading room', 'Near-silent, huge windows, almost never full before finals week.', 'study', 'all', 40.7295, -73.9965, '{}', true),
  ('YOUR-USER-ID-HERE', 'Rooftop garden behind the union', 'Free seating, good for a low-key first date or just decompressing.', 'date', 'all', 40.7301, -73.9970, '{}', true),
  ('YOUR-USER-ID-HERE', 'Hammock grove by the creek', 'Bring your own hammock — there are hooks on about a dozen trees.', 'relax', 'all', 40.7288, -73.9981, '{}', true);
