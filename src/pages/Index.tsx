import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/provex/PageShell";
import { ArrowRight, FileSignature, Database, ShieldCheck, Lock, Sparkles } from "lucide-react";

const ticker = [
  { id: "0xb1f4…a92c", who: "0xA1…F3", t: "2s ago" },
  { id: "0x77ec…01dd", who: "0x9C…4B", t: "11s ago" },
  { id: "0x4a91…ee10", who: "did:apt:0x12…", t: "23s ago" },
  { id: "0xc002…ff19", who: "0x38…9A", t: "47s ago" },
  { id: "0x88aa…b231", who: "0xE7…2D", t: "1m ago" },
  { id: "0x12cd…7704", who: "did:apt:0xab…", t: "1m ago" },
  { id: "0x55be…aa9c", who: "0x44…71", t: "2m ago" },
  { id: "0x9eef…3320", who: "0x66…8E", t: "2m ago" },
];

const Index = () => {
  const items = [...ticker, ...ticker];
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="container relative pt-24 pb-28 md:pt-32 md:pb-36">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
              Built on Shelby · Anchored to Aptos
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight">
              Verifiable Data <br /> Provenance on <span className="text-gradient">Shelby</span>.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
              If Shelby is the hard drive, Provex is the notary. Sign your data, store it on Shelby,
              and prove its origin on Aptos — forever.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/app">Launch App <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border/80 bg-card/40 backdrop-blur">
                <Link to="/explorer">Explore Data</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>11 · NINES DURABILITY</span>
              <span>SUB-SECOND VERIFY</span>
              <span>S3-COMPATIBLE INGEST</span>
            </div>
          </div>
        </div>

        {/* Live ticker */}
        <div className="relative border-y border-border/60 bg-card/30 backdrop-blur">
          <div className="container py-4 flex items-center gap-6">
            <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent">
              <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
              Live · Verified Uploads
            </div>
            <div className="overflow-hidden flex-1 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
              <div className="marquee font-mono text-xs">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    <span className="text-foreground">{it.id}</span>
                    <span className="opacity-50">·</span>
                    <span>{it.who}</span>
                    <span className="opacity-50">·</span>
                    <span className="opacity-70">{it.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">How it works</div>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
            Three steps. <span className="text-muted-foreground">Cryptographic certainty.</span>
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { n: "01", title: "Sign Data", icon: FileSignature, body: "Your wallet signs file metadata locally — never the file itself leaves unencrypted." },
            { n: "02", title: "Store on Shelby", icon: Database, body: "The blob is uploaded to Shelby's global namespace. You receive a Blob ID commitment." },
            { n: "03", title: "Verify on Aptos", icon: ShieldCheck, body: "An attestation is anchored on Aptos linking the Blob ID to your DID forever." },
          ].map(s => (
            <div key={s.n} className="glass rounded-2xl p-7 group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              <div className="mt-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="container pb-24">
        <div className="glass-strong rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="grid md:grid-cols-3 gap-10 relative">
            {[
              { icon: Sparkles, t: "AI Developers", b: "Prove your model trained on clean, attributed, legally-sourced data." },
              { icon: Lock, t: "Enterprises", b: "Immutable audit trails for sensitive documents and compliance logs." },
              { icon: ShieldCheck, t: "Web3 Protocols", b: "Decentralized, verifiable storage for off-chain computation data." },
            ].map(a => (
              <div key={a.t}>
                <a.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{a.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Index;
