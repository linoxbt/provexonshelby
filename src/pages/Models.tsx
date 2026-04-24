import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Plus, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { shortAddr } from "@/lib/provex";
import { toast } from "sonner";
import { ConnectWallet } from "@/components/provex/ConnectWallet";

type Model = {
  id: string;
  name: string;
  developer: string;
  weights_blob_id: string;
  training_corpus_blob_id: string | null;
  description: string | null;
  created_at: string;
};

const Models = () => {
  const { connected, account } = useWallet();
  const wallet = account?.address?.toString().toLowerCase() ?? null;

  const [models, setModels] = useState<Model[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", weights: "", corpus: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    const { data } = await supabase
      .from("verified_models")
      .select("*")
      .order("created_at", { ascending: false });
    setModels((data ?? []) as Model[]);
  };
  useEffect(() => { refresh(); }, []);

  const submit = async () => {
    if (!wallet) { toast.error("Connect a wallet first"); return; }
    if (!form.name || !form.weights) { toast.error("Name and weights BlobID required"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("register-model", {
        method: "POST",
        body: {
          name: form.name,
          weights_blob_id: form.weights,
          training_corpus_blob_id: form.corpus || undefined,
          description: form.description || undefined,
        },
        headers: { "X-Wallet-Address": wallet },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Model registered");
      setOpen(false);
      setForm({ name: "", weights: "", corpus: "", description: "" });
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to register model");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="container py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Verified Models</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">AI models with provable provenance.</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Each model below links its weights and training corpus to immutable Shelby blobs, anchored on Aptos.
            </p>
          </div>
          {connected ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
                  <Plus className="h-4 w-4 mr-1" /> Register Model
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Register a Verified Model</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  <Input placeholder="Model name (e.g. provex-llm-7b)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <Input placeholder="Weights BlobID (sha256 hex)" className="font-mono text-xs" value={form.weights} onChange={e => setForm({ ...form, weights: e.target.value })} />
                  <Input placeholder="Training corpus BlobID (optional)" className="font-mono text-xs" value={form.corpus} onChange={e => setForm({ ...form, corpus: e.target.value })} />
                  <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  <Button onClick={submit} disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground">
                    {submitting ? "Registering…" : "Register"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : <ConnectWallet />}
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map(m => (
            <div key={m.id} className="glass rounded-2xl p-6 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <Brain className="h-5 w-5 text-primary" />
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{m.name}</h3>
              {m.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
              <div className="mt-4 space-y-2 font-mono text-[11px]">
                <div className="text-muted-foreground uppercase tracking-widest">Developer</div>
                <div>{shortAddr(m.developer)}</div>
                <div className="text-muted-foreground uppercase tracking-widest mt-2">Weights</div>
                <Link to={`/dataset/${m.weights_blob_id}`} className="text-primary hover:underline truncate block">
                  {m.weights_blob_id.slice(0, 18)}…
                </Link>
                {m.training_corpus_blob_id && (
                  <>
                    <div className="text-muted-foreground uppercase tracking-widest mt-2">Training corpus</div>
                    <Link to={`/dataset/${m.training_corpus_blob_id}`} className="text-primary hover:underline truncate block">
                      {m.training_corpus_blob_id.slice(0, 18)}…
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
          {models.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
              <Brain className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="mt-4 text-sm text-muted-foreground">
                No verified models yet. {connected ? "Register the first one above." : "Connect a wallet to register one."}
              </p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default Models;
