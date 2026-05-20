import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageShell } from "@/components/provex/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, ShieldAlert, Download, ExternalLink, Clock, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { downloadBlob, shortAddr, type Attestation, type Dataset } from "@/lib/provex";
import { toast } from "sonner";

type VerifyResult = {
  status: "verified" | "unverified" | "pending";
  reason: string | null;
  dataset?: Dataset;
  attestation?: Attestation;
  lineage?: { parent_blob_id: string; child_blob_id: string }[];
  blob_id?: string;
};

const Explorer = () => {
  const { blobId: routeBlob } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(routeBlob ?? "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = async (raw: string) => {
    const id = raw.trim().toLowerCase().replace(/^0x/, "");
    if (!id) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        `verify-blob?blob_id=${encodeURIComponent(id)}`,
        { method: "GET" }
      );
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeBlob) {
      setQuery(routeBlob);
      verify(routeBlob);
    }
  }, [routeBlob]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = query.trim().toLowerCase().replace(/^0x/, "");
    if (id) navigate(`/explorer/${id}`);
  };

  const verified = result?.status === "verified";
  const unverified = result?.status === "unverified";

  return (
    <PageShell>
      <section className="container py-12">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Provex Explorer</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">The block explorer for data.</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Paste a Shelby Blob ID or Provex Attestation ID. We'll verify it against the Aptos chain in real time.
        </p>

        <form onSubmit={onSubmit} className="mt-8 glass-strong rounded-2xl p-2 flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground ml-3" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Shelby Blob ID or Provex Attestation ID…"
            className="border-0 bg-transparent font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow">
            {loading ? "Verifying…" : "Verify"}
          </Button>
        </form>

        {result && (
          <div className="mt-10 grid lg:grid-cols-3 gap-5 animate-fade-up">
            {/* Status panel */}
            <div className={`glass rounded-2xl p-7 lg:col-span-1 relative overflow-hidden ${
              unverified ? "ring-1 ring-destructive/40" : ""
            }`}>
              <div className={`absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl ${
                verified ? "bg-accent/20" : unverified ? "bg-destructive/25" : "bg-primary/15"
              }`} />
              <div className="relative">
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest ${
                  verified ? "bg-accent/15 text-accent"
                  : unverified ? "bg-destructive/15 text-destructive"
                  : "bg-primary/15 text-primary"
                }`}>
                  {verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  {result.status}
                </div>
                <div className={`mt-6 text-5xl font-semibold tracking-tight ${
                  verified ? "text-accent" : unverified ? "text-destructive" : "text-primary"
                }`}>
                  {result.status.toUpperCase()}
                </div>

                {unverified && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex items-start gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-widest">Reason</div>
                        <p className="text-sm mt-1 text-foreground/80">
                          {result.reason ?? "Could not verify this BlobID."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {verified && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Attestation matches the on-chain Aptos record.
                  </p>
                )}

                {result.dataset && (
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Uploader</div>
                        <div className="font-mono text-xs">{shortAddr(result.dataset.uploader)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Timestamp</div>
                        <div className="font-mono text-xs">{new Date(result.dataset.created_at).toUTCString()}</div>
                      </div>
                    </div>
                    {result.attestation?.aptos_tx_hash && (
                      <div className="flex items-start gap-3">
                        <ExternalLink className="h-4 w-4 mt-0.5 text-primary" />
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Aptos Tx</div>
                          <div className="font-mono text-xs">{result.attestation.aptos_tx_hash.slice(0, 8)}…</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.dataset && (
                  <Button
                    onClick={() => downloadBlob(result.dataset!.storage_path, result.dataset!.file_name)}
                    className="mt-7 w-full bg-gradient-primary text-primary-foreground shadow-glow"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download from Shelby
                  </Button>
                )}
              </div>
            </div>

            {/* Lineage / details panel */}
            <div className="glass rounded-2xl p-7 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Data Lineage</h3>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {(result.lineage?.length ?? 0)} edges
                </span>
              </div>

              {result.dataset ? (
                <>
                  {!result.lineage?.length ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                      No lineage recorded - this is a root dataset.
                    </p>
                  ) : (
                    <ul className="mt-4 divide-y divide-border/60">
                      {result.lineage.map((e, i) => (
                        <li key={i} className="py-3 flex items-center justify-between gap-3 font-mono text-xs">
                          <span className="text-muted-foreground">parent</span>
                          <Link to={`/explorer/${e.parent_blob_id}`} className="text-primary hover:underline truncate">
                            {e.parent_blob_id.slice(0, 12)}…{e.parent_blob_id.slice(-6)}
                          </Link>
                          <span className="opacity-50">→</span>
                          <Link to={`/explorer/${e.child_blob_id}`} className="hover:underline truncate">
                            {e.child_blob_id.slice(0, 12)}…{e.child_blob_id.slice(-6)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 grid sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="rounded-lg border border-border/60 px-3 py-2">
                      <div className="text-muted-foreground uppercase tracking-widest text-[10px]">Size</div>
                      <div className="mt-1">{(result.dataset.size_bytes / 1e6).toFixed(2)} MB</div>
                    </div>
                    <div className="rounded-lg border border-border/60 px-3 py-2">
                      <div className="text-muted-foreground uppercase tracking-widest text-[10px]">MIME</div>
                      <div className="mt-1 truncate">{result.dataset.mime_type}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 px-3 py-2">
                      <div className="text-muted-foreground uppercase tracking-widest text-[10px]">License</div>
                      <div className="mt-1">{result.dataset.license}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                  <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
                  <p className="mt-3 text-sm">
                    No record found for BlobID <span className="font-mono">{result.blob_id?.slice(0, 12)}…</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This file was never registered on Provex. It cannot be considered authentic.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Explorer;
