-- ==========================================================================
-- supabase/storage.sql
-- Run after rls_policies.sql. Creates the storage bucket used for both
-- spot photos and avatars, and locks down who can upload where.
-- ==========================================================================

insert into storage.buckets (id, name, public)
values ('whereloc-media', 'whereloc-media', true)
on conflict (id) do nothing;

-- Anyone can view photos (spots are public).
create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'whereloc-media');

-- A logged-in user may only upload into their own folder:
--   spots/{their-uid}/...   or   avatars/{their-uid}.jpg
-- storage.foldername(name) splits the object path into an array, e.g.
-- 'spots/abc123/photo.jpg' -> {spots, abc123, photo.jpg}.
create policy "users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'whereloc-media'
    and (
      (storage.foldername(name))[1] = 'spots' and (storage.foldername(name))[2] = auth.uid()::text
      or
      (storage.foldername(name))[1] = 'avatars' and name = 'avatars/' || auth.uid()::text || '.jpg'
    )
  );

create policy "users can overwrite their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'whereloc-media'
    and name = 'avatars/' || auth.uid()::text || '.jpg'
  );

create policy "users can delete their own uploads"
  on storage.objects for delete
  using (
    bucket_id = 'whereloc-media'
    and (
      (storage.foldername(name))[1] = 'spots' and (storage.foldername(name))[2] = auth.uid()::text
      or
      (storage.foldername(name))[1] = 'avatars' and name = 'avatars/' || auth.uid()::text || '.jpg'
    )
  );
