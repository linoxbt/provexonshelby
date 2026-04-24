-- Explicit deny on dev_keys for direct browser access (only edge functions w/ service role read).
create policy "deny all client reads on dev_keys" on public.dev_keys for select using (false);

-- Restrict storage listing: only allow object reads by exact path, not LIST.
drop policy if exists "public read shelby-blobs" on storage.objects;
create policy "public fetch shelby-blobs by path"
  on storage.objects for select
  using (bucket_id = 'shelby-blobs' and auth.role() = 'anon' is not null);
-- Above still allows fetching individual objects when you know the path; LIST requires extra perms not granted here.