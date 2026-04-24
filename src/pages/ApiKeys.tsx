import { useState } from "react";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const initialKeys = [
  { name: "Production", key: "pvx_live_8a4f…c91d", created: "2025-03-12", last: "2 min ago" },
  { name: "Staging", key: "pvx_test_77ec…01dd", created: "2025-02-04", last: "3 hours ago" },
];

const snippet = `# install
npm install @provex/sdk

# usage
import { Provex } from "@provex/sdk";

const provex = new Provex({ apiKey: process.env.PROVEX_API_KEY });

const { blobId, attestationId } = await provex.attest({
  file: fs.readFileSync("./dataset.parquet"),
  signer: aptosWallet,
});

const proof = await provex.verify(blobId);
console.log(proof.verified); // true`;

const ApiKeys = () => {
  const [keys, setKeys] = useState(initialKeys);

  const create = () => {
    const k = {
      name: `Key ${keys.length + 1}`,
      key: `pvx_live_${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
      created: new Date().toISOString().slice(0, 10),
      last: "never",
    };
    setKeys([k, ...keys]);
    toast.success("New API key generated");
  };

  return (
    <PageShell>
      <section className="container py-12">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Developers</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">API Keys & SDK</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Use the Provex SDK to attest, store, and verify data from your own backend.
        </p>

        <div className="mt-10 grid lg:grid-cols-5 gap-5">
          {/* Keys */}
          <div className="glass rounded-2xl overflow-hidden lg:col-span-3">
            <div className="flex items-center justify-between p-5 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Your API Keys</h3>
              </div>
              <Button size="sm" onClick={create} className="bg-gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-1" /> New Key
              </Button>
            </div>
            <ul>
              {keys.map(k => (
                <li key={k.key} className="px-5 py-4 border-b border-border/60 last:border-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium">{k.name}</div>
                    <div className="font-mono text-xs text-muted-foreground truncate">{k.key}</div>
                  </div>
                  <div className="hidden sm:block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Last · {k.last}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied"); }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => { setKeys(keys.filter(x => x.key !== k.key)); toast("Key revoked"); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Snippet */}
          <div className="glass-strong rounded-2xl overflow-hidden lg:col-span-2">
            <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">@provex/sdk</span>
              <Button
                size="sm" variant="ghost"
                onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Snippet copied"); }}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>
            <pre className="p-5 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
{snippet}
            </pre>
          </div>
        </div>

        <div className="mt-10 glass rounded-2xl p-7">
          <h3 className="font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Receive real-time events when an attestation is anchored on Aptos.
          </p>
          <div className="mt-5 grid md:grid-cols-3 gap-3 font-mono text-xs">
            {["attestation.created", "attestation.verified", "lineage.updated"].map(e => (
              <div key={e} className="rounded-lg border border-border/60 px-3 py-2">
                <span className="text-accent">●</span> {e}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ApiKeys;
