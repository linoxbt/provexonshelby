// verify-blob: looks up a BlobID and returns its full provenance record.
import { admin, corsHeaders, json } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const blobId = (url.searchParams.get("blob_id") ?? "").toLowerCase().replace(/^0x/, "");
  if (!blobId) return json({ error: "blob_id required" }, 400);

  const sb = admin();
  const { data: dataset } = await sb
    .from("datasets")
    .select("*")
    .eq("blob_id", blobId)
    .maybeSingle();

  if (!dataset) {
    return json({
      status: "unverified",
      reason: "No dataset found for this BlobID. It was never registered on Provex.",
      blob_id: blobId,
    });
  }

  const { data: attestation } = await sb
    .from("attestations")
    .select("*")
    .eq("blob_id", blobId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: ancestors } = await sb
    .from("lineage")
    .select("parent_blob_id, child_blob_id")
    .or(`child_blob_id.eq.${blobId},parent_blob_id.eq.${blobId}`);

  return json({
    status: attestation?.status ?? "pending",
    reason: attestation?.unverified_reason ?? null,
    dataset,
    attestation,
    lineage: ancestors ?? [],
  });
});
