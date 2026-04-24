// dev-keys: list / create / revoke API keys for a wallet.
// Plaintext key is returned ONCE at creation. Only its sha256 hash is stored.
import { admin, corsHeaders, ensureWallet, json, sha256Hex, walletFromReq } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const wallet = walletFromReq(req);
  if (!wallet) return json({ error: "Missing X-Wallet-Address header" }, 401);

  await ensureWallet(wallet);
  const sb = admin();

  if (req.method === "GET") {
    const { data, error } = await sb
      .from("dev_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .eq("owner", wallet)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 500);
    return json({ keys: data });
  }

  if (req.method === "POST") {
    const { name } = await req.json().catch(() => ({}));
    const random = crypto.getRandomValues(new Uint8Array(24));
    const hex = [...random].map((b) => b.toString(16).padStart(2, "0")).join("");
    const fullKey = `pvx_live_${hex}`;
    const keyHash = await sha256Hex(new TextEncoder().encode(fullKey));
    const keyPrefix = `${fullKey.slice(0, 16)}…${fullKey.slice(-4)}`;

    const { data, error } = await sb
      .from("dev_keys")
      .insert({
        owner: wallet,
        name: name?.trim() || `Key ${new Date().toISOString().slice(0, 10)}`,
        key_prefix: keyPrefix,
        key_hash: keyHash,
      })
      .select("id, name, key_prefix, created_at")
      .single();
    if (error) return json({ error: error.message }, 500);

    return json({ ...data, plaintext_key: fullKey });
  }

  if (req.method === "DELETE") {
    const { id } = await req.json().catch(() => ({}));
    if (!id) return json({ error: "id required" }, 400);
    const { error } = await sb
      .from("dev_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner", wallet);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});
