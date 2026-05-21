import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, ShieldAlert, GitBranch, ExternalLink, Hash, Receipt, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shortAddr, sha256Hex, type Attestation, type Dataset } from "@/lib/provex";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const APTOS_EXPLORER = (h: string) => `https://explorer.aptoslabs.com/txn/${h}?network=testnet`;

const DatasetDetail = () => {
  const { blobId } = useParams();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const [parents, setParents] = useState<string[]>([]);
  const [children, setChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blobId) return;
    const id = blobId.toLowerCase().replace(/^0x/, "");
    (async () => {
      setLoading(true);
      const [{ data: ds }, { data: at }, { data: lin }] = await Promise.all([
        supabase.from("datasets").select("*").eq("blob_id", id).maybeSingle(),
        supabase.from("attestations").select("*").eq("blob_id", id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("lineage").select("*")
          .or(`child_blob_id.eq.${id},parent_blob_id.eq.${id}`),
      ]);
      setDataset(ds as Dataset | null);
      setAttestation(at as Attestation | null);
      setParents(((lin ?? []) as any[]).filter(l => l.child_blob_id === id).map(l => l.parent_blob_id));
      setChildren(((lin ?? []) as any[]).filter(l => l.parent_blob_id === id).map(l => l.child_blob_id));
      setLoading(false);
    })();
  }, [blobId]);

  if (loading) {
    return <PageShell><div className="container py-20 font-mono text-sm text-muted-foreground">Loading…</div></PageShell>;
  }

  if (!dataset) {
    return (
      <PageShell>
        <div className="container py-20 max-w-xl">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-3xl font-semibold">Dataset not found</h1>
          <p className="mt-2 text-muted-foreground">No record exists for BlobID <span className="font-mono">{blobId}</span>.</p>
          <Button asChild className="mt-6"><Link to="/explorer">Back to Explorer</Link></Button>
        </div>
      </PageShell>
    );
  }

  const verified = attestation?.status === "verified";
  const unverified = attestation?.status === "unverified";

  return (
    <PageShell>
      <section className="container py-12 max-w-5xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Dataset</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight break-all">{dataset.file_name}</h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground break-all">{dataset.blob_id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/explorer/${dataset.blob_id}`}><GitBranch className="h-4 w-4 mr-1.5" /> Lineage</Link>
            </Button>
            <Button
              onClick={() => downloadBlob(dataset.storage_path, dataset.file_name)}
              className="bg-gradient-primary text-primary-foreground shadow-glow"
            >
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className={`glass rounded-2xl p-6 ${unverified ? "ring-1 ring-destructive/40" : ""}`}>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${
              verified ? "bg-accent/15 text-accent"
              : unverified ? "bg-destructive/15 text-destructive"
              : "bg-primary/15 text-primary"
            }`}>
              {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {attestation?.status ?? "pending"}
            </div>
            {unverified && (
              <p className="mt-3 text-sm text-foreground/80">{attestation?.unverified_reason}</p>
            )}
            {attestation?.aptos_tx_hash && (
              <div className="mt-4 flex items-center gap-2 font-mono text-xs">
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{attestation.aptos_tx_hash}</span>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Uploader</div>
            <div className="mt-2 font-mono text-sm break-all">{shortAddr(dataset.uploader)}</div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Created</div>
            <div className="mt-2 font-mono text-sm">{new Date(dataset.created_at).toUTCString()}</div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Size</div>
            <div className="mt-2 font-mono text-sm">{(dataset.size_bytes / 1e6).toFixed(3)} MB</div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">MIME</div>
            <div className="mt-2 font-mono text-sm">{dataset.mime_type}</div>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">License</div>
            <div className="mt-2 font-mono text-sm">{dataset.license}</div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold flex items-center gap-2"><Hash className="h-4 w-4 text-primary" /> Parents ({parents.length})</h3>
            {parents.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Root dataset - no parents.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {parents.map(p => (
                  <li key={p}>
                    <Link to={`/dataset/${p}`} className="font-mono text-xs text-primary hover:underline break-all">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold flex items-center gap-2"><Hash className="h-4 w-4 text-primary" /> Derivatives ({children.length})</h3>
            {children.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No derivatives recorded.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {children.map(c => (
                  <li key={c}>
                    <Link to={`/dataset/${c}`} className="font-mono text-xs text-primary hover:underline break-all">
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {attestation && (
          <div className="mt-6 glass rounded-2xl p-6">
            <h3 className="font-semibold">Signature</h3>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Public key</div>
            <div className="mt-1 font-mono text-xs break-all">{attestation.public_key}</div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Signature</div>
            <div className="mt-1 font-mono text-xs break-all">{attestation.signature}</div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Signed message</div>
            <pre className="mt-1 font-mono text-xs whitespace-pre-wrap text-muted-foreground">{attestation.message}</pre>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default DatasetDetail;
