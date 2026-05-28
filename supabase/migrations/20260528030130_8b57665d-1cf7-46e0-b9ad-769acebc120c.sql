
-- Add explicit deny-write RLS policies for client roles. All writes happen via
-- edge functions using the service_role, which bypasses RLS.

-- attestations
CREATE POLICY "deny client insert attestations" ON public.attestations FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update attestations" ON public.attestations FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete attestations" ON public.attestations FOR DELETE TO anon, authenticated USING (false);

-- datasets
CREATE POLICY "deny client insert datasets" ON public.datasets FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update datasets" ON public.datasets FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete datasets" ON public.datasets FOR DELETE TO anon, authenticated USING (false);

-- dev_keys
CREATE POLICY "deny client insert dev_keys" ON public.dev_keys FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update dev_keys" ON public.dev_keys FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete dev_keys" ON public.dev_keys FOR DELETE TO anon, authenticated USING (false);

-- lineage
CREATE POLICY "deny client insert lineage" ON public.lineage FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update lineage" ON public.lineage FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete lineage" ON public.lineage FOR DELETE TO anon, authenticated USING (false);

-- ticker_events
CREATE POLICY "deny client insert ticker_events" ON public.ticker_events FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update ticker_events" ON public.ticker_events FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete ticker_events" ON public.ticker_events FOR DELETE TO anon, authenticated USING (false);

-- verified_models
CREATE POLICY "deny client insert verified_models" ON public.verified_models FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update verified_models" ON public.verified_models FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete verified_models" ON public.verified_models FOR DELETE TO anon, authenticated USING (false);

-- wallets
CREATE POLICY "deny client insert wallets" ON public.wallets FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "deny client update wallets" ON public.wallets FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "deny client delete wallets" ON public.wallets FOR DELETE TO anon, authenticated USING (false);

-- Storage: fix shelby-blobs bucket policies. Reads stay public (BlobIDs are
-- content-addressed sha256 hashes), but writes/updates/deletes are restricted
-- to the service_role (used by edge functions).
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN (
        'shelby blobs public read',
        'shelby-blobs public read',
        'public read shelby-blobs',
        'shelby blobs anon read'
      )
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "shelby-blobs public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'shelby-blobs');

CREATE POLICY "shelby-blobs deny client insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id <> 'shelby-blobs');

CREATE POLICY "shelby-blobs deny client update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id <> 'shelby-blobs')
WITH CHECK (bucket_id <> 'shelby-blobs');

CREATE POLICY "shelby-blobs deny client delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id <> 'shelby-blobs');
