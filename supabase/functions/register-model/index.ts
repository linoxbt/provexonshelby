// register-model: link an AI model to its weights blob + training corpus blob.
import { admin, corsHeaders, ensureWallet, json, walletFromReq } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  const wallet = walletFromReq(req);
  if (!wallet) return json({ error: "Missing X-Wallet-Address header" }, 401);

  await ensureWallet(wallet);
  const body = await req.json().catch(() => ({}));
  const { name, weights_blob_id, training_corpus_blob_id, description } = body;
  if (!name || !weights_blob_id) return json({ error: "name, weights_blob_id required" }, 400);

  const sb = admin();
  const { data, error } = await sb
    .from("verified_models")
    .insert({
      name,
      developer: wallet,
      weights_blob_id: String(weights_blob_id).toLowerCase().replace(/^0x/, ""),
      training_corpus_blob_id: training_corpus_blob_id
        ? String(training_corpus_blob_id).toLowerCase().replace(/^0x/, "")
        : null,
      description: description ?? null,
    })
    .select()
    .single();
  if (error) return json({ error: error.message }, 400);
  return json(data);
});
