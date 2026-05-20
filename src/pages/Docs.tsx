import { PageShell } from "@/components/provex/PageShell";
import { Book, Code2, Workflow, ShieldCheck } from "lucide-react";

const Section = ({ icon: Icon, title, children }: any) => (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center gap-2 text-primary"><Icon className="h-5 w-5" /><h3 className="font-semibold text-lg text-foreground">{title}</h3></div>
    <div className="mt-3 text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </div>
);

const Docs = () => (
  <PageShell>
    <section className="container py-12 max-w-4xl">
      <div className="font-mono text-xs uppercase tracking-widest text-primary">Documentation</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Build with Provex</h1>
      <p className="mt-3 text-muted-foreground">Sign data with an Aptos wallet, commit to Shelby, anchor on-chain.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Section icon={Workflow} title="Lifecycle">
          <ol className="list-decimal pl-4 space-y-1">
            <li>Hash file locally → BlobID (SHA-256)</li>
            <li>Wallet signs attestation message (Ed25519)</li>
            <li>Bytes uploaded to Shelby; BlobID returned</li>
            <li>Aptos tx anchors BlobID ↔ wallet address</li>
          </ol>
        </Section>
        <Section icon={ShieldCheck} title="Network requirements">
          <p>Wallet must be on <strong>Aptos Testnet</strong>. The Connect button triggers a Shelby handshake signature once the wallet is on the right network.</p>
        </Section>
        <Section icon={Code2} title="SDK snippet">
          <pre className="bg-card/60 rounded p-3 overflow-x-auto text-xs"><code>{`import { Provex } from "@provex/sdk";
const px = new Provex({ apiKey: process.env.PROVEX_KEY });
const { blobId } = await px.attest(fileBytes, { license: "CC-BY-4.0" });`}</code></pre>
        </Section>
        <Section icon={Book} title="Need more?">
          <p>The Explorer page lists every public attestation. Use the API page to issue keys for CI/ML pipelines.</p>
        </Section>
      </div>
    </section>
  </PageShell>
);

export default Docs;
