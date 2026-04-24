import { useCallback, useState } from "react";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Database, FileCheck2, HardDrive, Upload, Eye, Share2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const datasets = [
  { name: "training-corpus-v4.parquet", date: "2025-04-22", hash: "0xb1f4…a92c", status: "Verified" },
  { name: "compliance-audit-Q1.pdf", date: "2025-04-19", hash: "0x77ec…01dd", status: "Verified" },
  { name: "user-events-2025-04.jsonl", date: "2025-04-18", hash: "0x4a91…ee10", status: "Pending" },
  { name: "model-weights-deltas.bin", date: "2025-04-15", hash: "0xc002…ff19", status: "Verified" },
  { name: "regulatory-filing.docx", date: "2025-04-10", hash: "0x88aa…b231", status: "Verified" },
];

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
  const [stage, setStage] = useState<"idle" | "signing" | "uploading" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  const simulate = useCallback(() => {
    setStage("signing");
    setProgress(0);
    setTimeout(() => {
      setStage("uploading");
      const t = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(t); setStage("done"); return 100; }
          return p + 8;
        });
      }, 180);
    }, 1100);
  }, []);

  return (
    <PageShell>
      <section className="container py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Dashboard</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">My Provenance</h1>
            <p className="text-muted-foreground mt-2">Wallet · <span className="font-mono text-foreground">0xA1F3…9D2B</span></p>
          </div>
          <Button asChild variant="outline" className="bg-card/40">
            <Link to="/explorer">Open Explorer</Link>
          </Button>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat label="Total Data Uploaded" value="248.6 GB" icon={HardDrive} sub="↑ 12.4 GB this week" />
          <Stat label="Attestations Signed" value="1,284" icon={FileCheck2} sub="100% verified" />
          <Stat label="Active Storage Providers" value="37" icon={Database} sub="Shelby network" />
        </div>

        {/* Upload */}
        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); simulate(); }}
            className={`lg:col-span-2 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
              drag ? "border-primary bg-primary/5" : "border-border bg-card/30"
            }`}
          >
            {stage === "idle" && (
              <>
                <Upload className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Drop a file to attest</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Files are signed locally with your wallet, then committed to Shelby.
                </p>
                <Button onClick={simulate} className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow">
                  Choose File
                </Button>
              </>
            )}
            {stage === "signing" && (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <div className="font-mono text-sm">Signing with wallet…</div>
                <div className="text-xs text-muted-foreground">Awaiting confirmation in Petra</div>
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
            {stage === "done" && (
              <div className="py-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent px-3 py-1 font-mono text-xs uppercase tracking-widest">
                  ✓ Verified on Aptos
                </div>
                <div className="font-mono mt-4 text-sm">Blob ID · 0xfa3c…11b9</div>
                <Button onClick={() => setStage("idle")} variant="ghost" className="mt-4">Upload another</Button>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h4 className="font-semibold">Activity</h4>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { t: "Attestation signed", d: "0xb1f4…a92c" },
                { t: "Shelby commitment", d: "248 KB · 1m ago" },
                { t: "Lineage updated", d: "derived from 0x4a91…" },
              ].map((a, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                  <span>{a.t}</span>
                  <span className="font-mono text-xs text-muted-foreground">{a.d}</span>
                </li>
              ))}
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
                {datasets.map(d => (
                  <tr key={d.name} className="border-t border-border/60 hover:bg-card/40 transition-colors">
                    <td className="px-5 py-4 font-medium">{d.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{d.date}</td>
                    <td className="px-5 py-4 font-mono text-xs">{d.hash}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                        d.status === "Verified"
                          ? "bg-accent/15 text-accent"
                          : "bg-primary/15 text-primary"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${d.status === "Verified" ? "bg-accent" : "bg-primary pulse-dot"}`} />
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/explorer"><Eye className="h-4 w-4 mr-1" /> View</Link>
                      </Button>
                      <Button size="sm" variant="ghost"><Share2 className="h-4 w-4 mr-1" /> Share</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Dashboard;
