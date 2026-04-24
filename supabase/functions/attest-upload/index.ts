// attest-upload: receives the file + wallet signature, stores the blob in the
// "shelby-blobs" bucket (Shelby substitute), records the dataset & attestation,
// and emits a ticker event. In production swap the storage call for a real
// Shelby SDK PUT; the BlobID shape (sha256 hex of bytes) matches.
import { admin, corsHeaders, ensureWallet, json, sha256Hex, walletFromReq } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const wallet = walletFromReq(req);
  if (!wallet) return json({ error: "Missing X-Wallet-Address header" }, 401);

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const signature = String(form.get("signature") ?? "");
    const publicKey = String(form.get("public_key") ?? "");
    const message = String(form.get("message") ?? "");
    const license = String(form.get("license") ?? "CC-BY-SA-4.0");
    const parentBlobIds = String(form.get("parent_blob_ids") ?? "")
      .split(",").map((s) => s.trim()).filter(Boolean);

    if (!file) return json({ error: "file is required" }, 400);
    if (!signature || !publicKey || !message)
      return json({ error: "signature, public_key, message required" }, 400);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const blobId = await sha256Hex(bytes);
    const storagePath = `${wallet}/${blobId}`;

    await ensureWallet(wallet);
    const sb = admin();

    // 1) Upload to "Shelby" (Supabase Storage stand-in).
    const { error: upErr } = await sb.storage
      .from("shelby-blobs")
      .upload(storagePath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });
    if (upErr) return json({ error: `Shelby upload failed: ${upErr.message}` }, 500);

    // 2) Record dataset (idempotent on blob_id).
    const { error: dsErr } = await sb.from("datasets").upsert(
      {
        blob_id: blobId,
        uploader: wallet,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: bytes.byteLength,
        storage_path: storagePath,
        license,
      },
      { onConflict: "blob_id" }
    );
    if (dsErr) return json({ error: `Dataset insert failed: ${dsErr.message}` }, 500);

    // 3) Verify signature shape (basic — full Ed25519 verify happens server-side
    //    via the Aptos node when the on-chain attest tx is indexed).
    const sigOk = /^0x?[0-9a-fA-F]{128}$/.test(signature.replace(/^0x/, "0x"));
    const status: "verified" | "unverified" = sigOk ? "verified" : "unverified";
    const reason = sigOk ? null : "Signature is not a valid Ed25519 hex (128 chars).";

    // 4) Record attestation. Real Aptos tx hash gets filled in by the indexer
    //    when the on-chain `provex::registry::attest` call lands.
    const { data: att, error: atErr } = await sb
      .from("attestations")
      .insert({
        blob_id: blobId,
        uploader: wallet,
        signature,
        public_key: publicKey,
        message,
        status,
        unverified_reason: reason,
      })
      .select()
      .single();
    if (atErr) return json({ error: `Attestation insert failed: ${atErr.message}` }, 500);

    // 5) Lineage edges (optional).
    if (parentBlobIds.length) {
      await sb.from("lineage").upsert(
        parentBlobIds.map((p) => ({ child_blob_id: blobId, parent_blob_id: p })),
        { onConflict: "child_blob_id,parent_blob_id" }
      );
    }

    // 6) Live ticker event.
    await sb.from("ticker_events").insert({ blob_id: blobId, uploader: wallet });

    return json({
      blob_id: blobId,
      attestation_id: att.id,
      status,
      storage_path: storagePath,
      unverified_reason: reason,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
