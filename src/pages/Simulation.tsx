import { useState } from "react";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Play, RotateCcw } from "lucide-react";

const steps = [
  { name: "Hash file", detail: "sha256(bytes) → BlobID" },
  { name: "Sign attestation", detail: "wallet.signMessage(canonical)" },
  { name: "Upload to Shelby", detail: "PUT /blob → BlobID committed" },
  { name: "Anchor on Aptos", detail: "provex::registry::attest" },
  { name: "Index for Explorer", detail: "ticker_events INSERT → realtime" },
];

const Simulation = () => {
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    for (let i = 0; i < steps.length; i++) {
      setActive(i);
      await new Promise((r) => setTimeout(r, 900));
    }
    setRunning(false);
  };
  const reset = () => { setActive(-1); setRunning(false); };

  return (
    <PageShell>
      <section className="container py-12 max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Simulation</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Attestation flow</h1>
        <p className="mt-3 text-muted-foreground">Watch the full Provex pipeline run without uploading real data.</p>

        <div className="mt-6 flex gap-2">
          <Button onClick={run} disabled={running} className="bg-gradient-primary text-primary-foreground shadow-glow">
            {running ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
            Run simulation
          </Button>
          <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4 mr-1.5" /> Reset</Button>
        </div>

        <ol className="mt-8 space-y-3">
          {steps.map((s, i) => {
            const state = i < active || (!running && active >= 0 && i <= active) ? "done"
              : i === active && running ? "active" : "idle";
            return (
              <li key={s.name} className={`glass rounded-xl p-4 flex items-center gap-4 transition-colors ${
                state === "active" ? "border-primary/60" : ""
              }`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs ${
                  state === "done" ? "bg-accent/20 text-accent" : state === "active" ? "bg-primary/20 text-primary" : "bg-card/60 text-muted-foreground"
                }`}>
                  {state === "done" ? <Check className="h-4 w-4" /> : state === "active" ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{s.detail}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </PageShell>
  );
};

export default Simulation;
