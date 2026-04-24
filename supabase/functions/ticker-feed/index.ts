// ticker-feed: paginated list of recent attestation events for the live ticker.
import { admin, corsHeaders, json } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const before = url.searchParams.get("before"); // ISO timestamp for pagination

  const sb = admin();
  let q = sb
    .from("ticker_events")
    .select("id, blob_id, uploader, event_type, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);

  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);

  const next = data && data.length === limit ? data[data.length - 1].created_at : null;
  return json({ events: data ?? [], next_before: next });
});
