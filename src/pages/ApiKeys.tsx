import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { ConnectWallet } from "@/components/provex/ConnectWallet";

type DevKey = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
};

const ApiKeys = () => {
  const { connected, account } = useWallet();
  const wallet = account?.address?.toString().toLowerCase() ?? null;

  const [keys, setKeys] = useState<DevKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null); // last-created plaintext

  const refresh = async () => {
    if (!wallet) { setKeys([]); return; }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("dev-keys", {
      method: "GET",
      headers: { "X-Wallet-Address": wallet },
    });
    if (error) toast.error(error.message);
    setKeys(data?.keys ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [wallet]);

  const create = async () => {
    if (!wallet) { toast.error("Connect a wallet first"); return; }
    const { data, error } = await supabase.functions.invoke("dev-keys", {
      method: "POST",
      body: { name: `Key ${keys.length + 1}` },
      headers: { "X-Wallet-Address": wallet },
    });
    if (error || data?.error) { toast.error(error?.message ?? data?.error); return; }
    setActiveKey(data.plaintext_key);
    toast.success("New API key generated — copy it now, it won't be shown again");
    refresh();
  };

  const revoke = async (id: string) => {
    if (!wallet) return;
    const { error } = await supabase.functions.invoke("dev-keys", {
      method: "DELETE",
      body: { id },
      headers: { "X-Wallet-Address": wallet },
    });
    if (error) { toast.error(error.message); return; }
    toast("Key revoked");
    refresh();
  };

  const snippetKey = activeKey ?? (keys[0]?.key_prefix ?? "pvx_live_<your_key>");
  const snippet = useMemo(() => `# install
npm install @provex/sdk

# usage
import { Provex } from "@provex/sdk";

const provex = new Provex({ apiKey: "${snippetKey}" });

const { blobId, attestationId } = await provex.attest({
  file: fs.readFileSync("./dataset.parquet"),
  signer: aptosWallet,
});

const proof = await provex.verify(blobId);
console.log(proof.verified); // true`, [snippetKey]);

  return (
    <PageShell>
      <section className="container py-12">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Developers</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">API Keys & SDK</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Use the Provex SDK to attest, store, and verify data from your own backend.
        </p>

        {!connected && (
          <div className="mt-8 glass rounded-2xl p-8 text-center">
            <Key className="h-8 w-8 text-primary mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">
              Connect a wallet to view and manage your API keys.
            </p>
            <div className="mt-4 inline-block"><ConnectWallet /></div>
          </div>
        )}

        {connected && (
          <>
            {activeKey && (
              <div className="mt-8 rounded-2xl border border-accent/40 bg-accent/5 p-5">
                <div className="font-mono text-[11px] uppercase tracking-widest text-accent">⚠ Save this key now</div>
                <div className="mt-2 flex items-center gap-2">
                  <code className="font-mono text-xs flex-1 break-all">{activeKey}</code>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(activeKey); toast.success("Copied"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">It will not be shown again — only the prefix is stored.</p>
              </div>
            )}

            <div className="mt-8 grid lg:grid-cols-5 gap-5">
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
                  {loading && <li className="px-5 py-6 text-sm text-muted-foreground">Loading…</li>}
                  {!loading && keys.length === 0 && (
                    <li className="px-5 py-6 text-sm text-muted-foreground">No keys yet. Generate one above.</li>
                  )}
                  {keys.map(k => (
                    <li key={k.id} className="px-5 py-4 border-b border-border/60 last:border-0 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium">{k.name}</div>
                        <div className="font-mono text-xs text-muted-foreground truncate">{k.key_prefix}</div>
                      </div>
                      <div className="hidden sm:block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {k.last_used_at ? `Last · ${new Date(k.last_used_at).toLocaleDateString()}` : "Never used"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(k.key_prefix); toast.success("Prefix copied"); }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => revoke(k.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-strong rounded-2xl overflow-hidden lg:col-span-2">
                <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">@provex/sdk</span>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(snippet); toast.success("Snippet copied"); }}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="p-5 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">{snippet}</pre>
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
          </>
        )}
      </section>
    </PageShell>
  );
};

export default ApiKeys;
