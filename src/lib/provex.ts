import { supabase } from "@/integrations/supabase/client";

/**
 * sha256 helper using WebCrypto (browser).
 * Returns lowercase hex string — same shape Shelby returns for BlobIDs.
 */
export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const buf = data instanceof Uint8Array ? data : new Uint8Array(data);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const shortAddr = (a: string | null | undefined) =>
  a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";

export const shortBlob = (b: string | null | undefined) =>
  b ? `0x${b.slice(0, 4)}…${b.slice(-4)}` : "—";

export type Dataset = {
  id: string;
  blob_id: string;
  uploader: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  license: string | null;
  created_at: string;
};

export type Attestation = {
  id: string;
  blob_id: string;
  uploader: string;
  signature: string;
  public_key: string;
  message: string;
  aptos_tx_hash: string | null;
  status: "pending" | "verified" | "unverified";
  unverified_reason: string | null;
  created_at: string;
};

export const downloadBlob = async (storagePath: string, fileName: string) => {
  const { data } = supabase.storage.from("shelby-blobs").getPublicUrl(storagePath);
  const url = data.publicUrl;
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
};
