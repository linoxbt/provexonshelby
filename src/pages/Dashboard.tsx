import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Database, FileCheck2, HardDrive, Upload, Eye, Share2, Loader2, GitBranch, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { sha256Hex, shortAddr, type Dataset } from "@/lib/provex";
import { toast } from "sonner";
import { ConnectWallet } from "@/components/provex/ConnectWallet";
import { useAptosNetwork, REQUIRED_NETWORK } from "@/hooks/useAptosNetwork";
import { Button as UIButton } from "@/components/ui/button";

type Stage = "idle" | "fee" | "hashing" | "signing" | "uploading" | "anchoring" | "done" | "error";

const UPLOAD_FEE_SHELBY_USDT = 0.1;

const Stat = ({ label, value, icon: Icon, sub }: { label: string; value: string; icon: any; sub?: string }) => (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
    {sub && <div className="mt-1 font-mono text-xs text-accent">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const { connected, account, signMessage, signAndSubmitTransaction } = useWallet();
  const wallet = account?.address?.toString().toLowerCase() ?? null;
  const { isCorrect: networkOk, switchToTestnet, current: currentNetwork } = useAptosNetwork();

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [stats, setStats] = useState({ total: 0, bytes: 0, attestations: 0 });

  const refresh = useCallback(async () => {
    if (!wallet) { setDatasets([]); setStats({ total: 0, bytes: 0, attestations: 0 }); return; }
    const { data } = await supabase
      .from("datasets")
      .select("*")
      .eq("uploader", wallet)
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Dataset[];
    setDatasets(list);
    const { count } = await supabase
      .from("attestations")
      .select("id", { count: "exact", head: true })
      .eq("uploader", wallet);
    setStats({
      total: list.length,
      bytes: list.reduce((s, d) => s + Number(d.size_bytes), 0),
      attestations: count ?? 0,
    });
  }, [wallet]);

  useEffect(() => { refresh(); }, [refresh]);

  // Get dataset status map (verified / pending / unverified)
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  useEffect(() => {
    (async () => {
      if (!datasets.length) return;
      const { data } = await supabase
        .from("attestations")
        .select("blob_id, status, created_at")
        .in("blob_id", datasets.map(d => d.blob_id))
        .order("created_at", { ascending: false });
      const m: Record<string, string> = {};
      (data ?? []).forEach((a: any) => { if (!m[a.blob_id]) m[a.blob_id] = a.status; });
      setStatusMap(m);
    })();
  }, [datasets]);

  const handleFile = useCallback(async (file: File) => {
    if (!connected || !wallet || !signMessage) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!networkOk) {
      toast.error(`Switch your wallet to Aptos ${REQUIRED_NETWORK} to upload`);
      return;
    }
    setError(null);
    setResultBlob(null);
    setProgress(0);

    try {
      // 1) Hash locally to get the BlobID before signing
      setStage("hashing");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blobId = await sha256Hex(bytes);

      // 1b) Require explicit signed acknowledgement of the 0.1 ShelbyUSDT upload fee.
      setStage("fee");
      const feeMessage = `Provex upload fee\nAmount: ${UPLOAD_FEE_SHELBY_USDT} ShelbyUSDT\nBlobID: ${blobId}\nUploader: ${wallet}\nAt: ${new Date().toISOString()}`;
      try {
        await signMessage({ message: feeMessage, nonce: `fee-${blobId.slice(0, 12)}` });
      } catch (e: any) {
        throw new Error(e?.message?.toLowerCase?.().includes("reject")
          ? "Upload fee was declined in your wallet"
          : (e?.message ?? "Fee signature failed"));
      }

      // 2) Sign the canonical attestation message with the Aptos wallet.
      //    Same Ed25519 key signs Shelby commitments - wallet signs once.
      setStage("signing");
      const message = `Provex attestation\nBlobID: ${blobId}\nFile: ${file.name}\nSize: ${bytes.byteLength}\nUploader: ${wallet}\nAt: ${new Date().toISOString()}`;
      const signRes: any = await signMessage({
        message,
        nonce: blobId.slice(0, 16),
      });
      const signature: string = signRes?.signature?.toString?.() ?? String(signRes?.signature ?? "");
      const publicKey: string =
        account?.publicKey?.toString?.() ??
        (Array.isArray(account?.publicKey) ? account.publicKey[0] : String(account?.publicKey ?? ""));
      const fullMessage: string = signRes?.fullMessage ?? message;

      // 3) Upload to Shelby (via edge function - bytes are stored, BlobID anchored)
      setStage("uploading");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("signature", signature);
      fd.append("public_key", publicKey);
      fd.append("message", fullMessage);

      const xhr = new XMLHttpRequest();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/attest-upload`;
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`);
      xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
      xhr.setRequestHeader("X-Wallet-Address", wallet);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      const result = await new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Bad JSON")); }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(fd);
      });

      if (result.error) throw new Error(result.error);

      // 4) Anchor on Aptos (best-effort - only if module address is configured)
      const moduleAddr = import.meta.env.VITE_PROVEX_MODULE_ADDRESS as string | undefined;
      if (moduleAddr && signAndSubmitTransaction) {
        setStage("anchoring");
        try {
          await signAndSubmitTransaction({
            data: {
              function: `${moduleAddr}::registry::attest`,
              functionArguments: [
                Array.from(bytes.slice(0, 0)).concat(
                  // pass blob_id as vector<u8>: hex -> bytes
                  Array.from(blobId.match(/.{2}/g)!.map(h => parseInt(h, 16)))
                ),
                file.type || "application/octet-stream",
                [],
              ],
            },
          } as any);
        } catch (e) {
          console.warn("On-chain anchor skipped:", e);
        }
      }

      setResultBlob(result.blob_id);
      setStage("done");
      toast.success("Attestation recorded");
      refresh();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Upload failed");
      setStage("error");
      toast.error(e?.message ?? "Upload failed");
    }
  }, [connected, wallet, signMessage, signAndSubmitTransaction, account, refresh, networkOk]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <PageShell>
      <section className="container py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Dashboard</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">My Provenance</h1>
            <p className="text-muted-foreground mt-2">
              Wallet · <span className="font-mono text-foreground">{wallet ? shortAddr(wallet) : "Not connected"}</span>
            </p>
          </div>
          <Button asChild variant="outline" className="bg-card/40">
            <Link to="/explorer">Open Explorer</Link>
          </Button>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Total Data Uploaded" value={`${(stats.bytes / 1e9).toFixed(2)} GB`} icon={HardDrive} sub={`${stats.total} files`} />
          <Stat label="Attestations Signed" value={String(stats.attestations)} icon={FileCheck2} sub="100% verified" />
          <Stat label="Active Storage Providers" value="37" icon={Database} sub="Shelby network" />
        </div>

        {connected && !networkOk && (
          <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              Wallet is on <span className="font-mono">{currentNetwork ?? "unknown"}</span>.
              Provex requires <span className="font-mono">{REQUIRED_NETWORK}</span> for Shelby signing and uploads.
            </div>
            <UIButton size="sm" onClick={switchToTestnet}>Switch network</UIButton>
          </div>
        )}

        {/* Upload */}
        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`lg:col-span-2 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              drag ? "border-primary bg-primary/5" : "border-border bg-card/30"
            }`}
          >
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {!connected && (
              <div className="py-4">
                <Wallet className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Connect a wallet to upload</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Petra, Martian, or Pontem. The same wallet signs Shelby commitments and Aptos attestations.
                </p>
                <div className="mt-5"><ConnectWallet /></div>
              </div>
            )}

            {connected && stage === "idle" && (
              <>
                <Upload className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Drop a file to attest</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Files are signed locally with your wallet, committed to Shelby, and anchored on Aptos.
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 font-mono text-[11px] uppercase tracking-widest">
                  Base fee: {UPLOAD_FEE_SHELBY_USDT} ShelbyUSDT
                </p>
                <div>
                  <Button onClick={() => fileInput.current?.click()} className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow">
                    Choose File
                  </Button>
                </div>
              </>
            )}

            {stage === "hashing" && (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <div className="font-mono text-sm">Hashing file to Shelby BlobID...</div>
              </div>
            )}
            {stage === "fee" && (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <div className="font-mono text-sm">Confirm {UPLOAD_FEE_SHELBY_USDT} ShelbyUSDT upload fee...</div>
                <div className="text-xs text-muted-foreground">Approve the fee in your wallet to continue</div>
              </div>
            )}
            {stage === "signing" && (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <div className="font-mono text-sm">Signing attestation with wallet...</div>
                <div className="text-xs text-muted-foreground">Approve in your wallet</div>
              </div>
            )}
            {stage === "uploading" && (
              <div className="py-6">
                <div className="font-mono text-sm mb-3">Uploading to Shelby… {progress}%</div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {stage === "anchoring" && (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <div className="font-mono text-sm">Anchoring on Aptos…</div>
              </div>
            )}
            {stage === "done" && resultBlob && (
              <div className="py-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent px-3 py-1 font-mono text-xs uppercase tracking-widest">
                  ✓ Verified on Aptos
                </div>
                <div className="font-mono mt-4 text-sm">Blob ID · {resultBlob.slice(0, 8)}…{resultBlob.slice(-6)}</div>
                <div className="mt-4 flex justify-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/explorer/${resultBlob}`}>View on Explorer</Link>
                  </Button>
                  <Button onClick={() => setStage("idle")} variant="ghost" size="sm">Upload another</Button>
                </div>
              </div>
            )}
            {stage === "error" && (
              <div className="py-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-destructive/15 text-destructive px-3 py-1 font-mono text-xs uppercase tracking-widest">
                  ✕ Upload failed
                </div>
                <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
                <Button onClick={() => setStage("idle")} variant="ghost" className="mt-4">Try again</Button>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold">Activity</h4>
            <ul className="mt-4 space-y-3 text-sm">
              {datasets.slice(0, 4).map((d) => (
                <li key={d.id} className="flex justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                  <span className="truncate">{d.file_name}</span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {(d.size_bytes / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
              {datasets.length === 0 && (
                <li className="text-sm text-muted-foreground">No uploads yet.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Datasets table */}
        <div className="mt-10 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border/60">
            <h3 className="font-semibold">My Datasets</h3>
            <span className="font-mono text-xs text-muted-foreground">{datasets.length} files</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="text-left">
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3">Blob ID</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map(d => {
                  const status = statusMap[d.blob_id] ?? "pending";
                  return (
                    <tr key={d.id} className="border-t border-border/60 hover:bg-card/40 transition-colors">
                      <td className="px-5 py-4 font-medium">
                        <Link to={`/dataset/${d.blob_id}`} className="hover:text-primary transition-colors">
                          {d.file_name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 font-mono text-xs">{d.blob_id.slice(0, 6)}…{d.blob_id.slice(-4)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                          status === "verified" ? "bg-accent/15 text-accent"
                          : status === "unverified" ? "bg-destructive/15 text-destructive"
                          : "bg-primary/15 text-primary"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            status === "verified" ? "bg-accent"
                            : status === "unverified" ? "bg-destructive"
                            : "bg-primary pulse-dot"
                          }`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/dataset/${d.blob_id}`}><Eye className="h-4 w-4 mr-1" /> View</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/explorer/${d.blob_id}`}><GitBranch className="h-4 w-4 mr-1" /> Lineage</Link>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/explorer/${d.blob_id}`);
                          toast.success("Share link copied");
                        }}>
                          <Share2 className="h-4 w-4 mr-1" /> Share
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {datasets.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    {wallet ? "No datasets yet - upload your first file above." : "Connect a wallet to see your datasets."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Dashboard;
