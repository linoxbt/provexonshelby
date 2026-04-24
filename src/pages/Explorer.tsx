import { useState } from "react";
import { PageShell } from "@/components/provex/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, Download, ExternalLink, Clock, User } from "lucide-react";

const lineage = [
  { id: "0x4a91…ee10", label: "raw-events.jsonl", x: 60, y: 140, root: true },
  { id: "0x88aa…b231", label: "cleaned-v2.parquet", x: 280, y: 80 },
  { id: "0xc002…ff19", label: "features-train.bin", x: 280, y: 200 },
  { id: "0xb1f4…a92c", label: "training-corpus-v4", x: 520, y: 140, current: true },
];

const edges = [
  ["0x4a91…ee10", "0x88aa…b231"],
  ["0x4a91…ee10", "0xc002…ff19"],
  ["0x88aa…b231", "0xb1f4…a92c"],
  ["0xc002…ff19", "0xb1f4…a92c"],
];

const Explorer = () => {
  const [query, setQuery] = useState("0xb1f4a92c8e1d4a7b2c3f9e0a1b2c3d4e5f6a7b8c");
  const [submitted, setSubmitted] = useState(true);

  const node = (id: string) => lineage.find(n => n.id === id)!;

  return (
    <PageShell>
      <section className="container py-12">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Provex Explorer</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">The block explorer for data.</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Paste a Shelby Blob ID or Provex Attestation ID. We'll verify it against the Aptos chain in real time.
        </p>

        <form
          onSubmit={e => { e.preventDefault(); setSubmitted(true); }}
          className="mt-8 glass-strong rounded-2xl p-2 flex items-center gap-2"
        >
          <Search className="h-5 w-5 text-muted-foreground ml-3" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Shelby Blob ID or Provex Attestation ID…"
            className="border-0 bg-transparent font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" className="bg-gradient-primary text-primary-foreground shadow-glow">Verify</Button>
        </form>

        {submitted && (
          <div className="mt-10 grid lg:grid-cols-3 gap-5 animate-fade-up">
            {/* Status */}
            <div className="glass rounded-2xl p-7 lg:col-span-1 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent px-3 py-1.5 font-mono text-xs uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </div>
                <div className="mt-6 text-5xl font-semibold tracking-tight text-accent">VERIFIED</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Attestation matches the on-chain Aptos record.
                </p>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Uploader</div>
                      <div className="font-mono text-xs">0xA1F3…9D2B</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Timestamp</div>
                      <div className="font-mono text-xs">2025-04-22 14:32:08 UTC</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Aptos Tx</div>
                      <div className="font-mono text-xs">0x91ec…44a8</div>
                    </div>
                  </div>
                </div>
                <Button className="mt-7 w-full bg-gradient-primary text-primary-foreground shadow-glow">
                  <Download className="h-4 w-4 mr-2" /> Download from Shelby
                </Button>
              </div>
            </div>

            {/* Lineage */}
            <div className="glass rounded-2xl p-7 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Data Lineage</h3>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  4 ancestors · 2 generations
                </span>
              </div>

              <div className="mt-6 relative w-full overflow-x-auto">
                <svg viewBox="0 0 700 280" className="w-full min-w-[600px] h-[280px]">
                  <defs>
                    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {edges.map(([a, b], i) => {
                    const A = node(a), B = node(b);
                    return (
                      <path
                        key={i}
                        d={`M ${A.x + 60} ${A.y} C ${A.x + 160} ${A.y}, ${B.x - 100} ${B.y}, ${B.x - 60} ${B.y}`}
                        stroke="url(#edge)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    );
                  })}
                  {lineage.map(n => (
                    <g key={n.id} transform={`translate(${n.x - 60}, ${n.y - 28})`}>
                      <rect
                        width="120" height="56" rx="12"
                        fill={n.current ? "hsl(var(--primary) / 0.18)" : "hsl(var(--card))"}
                        stroke={n.current ? "hsl(var(--primary))" : "hsl(var(--border))"}
                        strokeWidth={n.current ? 1.5 : 1}
                      />
                      {n.current && (
                        <circle cx="110" cy="10" r="4" fill="hsl(var(--accent))">
                          <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <text x="12" y="22" fill="hsl(var(--foreground))" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">
                        {n.label.length > 16 ? n.label.slice(0, 15) + "…" : n.label}
                      </text>
                      <text x="12" y="40" fill="hsl(var(--muted-foreground))" fontSize="10" fontFamily="JetBrains Mono">
                        {n.id}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="rounded-lg border border-border/60 px-3 py-2">
                  <div className="text-muted-foreground uppercase tracking-widest text-[10px]">Size</div>
                  <div className="mt-1">2.41 GB</div>
                </div>
                <div className="rounded-lg border border-border/60 px-3 py-2">
                  <div className="text-muted-foreground uppercase tracking-widest text-[10px]">MIME</div>
                  <div className="mt-1">application/parquet</div>
                </div>
                <div className="rounded-lg border border-border/60 px-3 py-2">
                  <div className="text-muted-foreground uppercase tracking-widest text-[10px]">License</div>
                  <div className="mt-1">CC-BY-SA-4.0</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Explorer;
