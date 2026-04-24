// Provex shared edge function utilities.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-wallet-address",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

/** Lowercased Aptos wallet address from request header (set by frontend). */
export const walletFromReq = (req: Request) => {
  const w = req.headers.get("x-wallet-address");
  if (!w) return null;
  return w.toLowerCase();
};

export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const ab =
    data instanceof Uint8Array
      ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      : data;
  const hash = await crypto.subtle.digest("SHA-256", ab as ArrayBuffer);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function ensureWallet(address: string) {
  const sb = admin();
  await sb
    .from("wallets")
    .upsert(
      { address, last_seen_at: new Date().toISOString() },
      { onConflict: "address" }
    );
}
