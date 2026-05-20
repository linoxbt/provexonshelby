import { PageShell } from "@/components/provex/PageShell";
import { Link } from "react-router-dom";
import {
  Book, Code2, Workflow, ShieldCheck, Key, Bot, Download, Wallet,
  Coins, FileSignature, Network, AlertTriangle, Database, GitBranch,
} from "lucide-react";

const Section = ({ id, icon: Icon, title, children }: any) => (
  <section id={id} className="glass rounded-2xl p-6 scroll-mt-24">
    <div className="flex items-center gap-2 text-primary">
      <Icon className="h-5 w-5" />
      <h2 className="font-semibold text-xl text-foreground">{title}</h2>
    </div>
    <div className="mt-4 text-sm text-muted-foreground space-y-3 leading-relaxed">{children}</div>
  </section>
);

const TOC = () => {
  const items = [
    ["overview", "Overview"],
    ["lifecycle", "Attestation lifecycle"],
    ["fee", "Upload fee (0.1 ShelbyUSDT)"],
    ["wallets", "Supported wallets & network"],
    ["downloads", "Downloading uploaded files"],
    ["api-keys", "API keys"],
    ["sdk", "SDK"],
    ["models", "Models registry"],
    ["explorer", "Explorer & lineage"],
    ["security", "Security model"],
    ["faq", "FAQ"],
  ];
  return (
    <nav className="lg:sticky lg:top-24 glass rounded-2xl p-5 h-fit text-sm">
      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Contents</div>
      <ul className="space-y-1.5">
        {items.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="text-muted-foreground hover:text-primary transition-colors block">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Code = ({ children }: any) => (
  <pre className="bg-card/60 rounded-lg p-3 overflow-x-auto text-xs border border-border/60">
    <code>{children}</code>
  </pre>
);

const Docs = () => (
  <PageShell>
    <section className="container py-10 md:py-14">
      <div className="max-w-4xl">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Documentation</div>
        <h1 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">Build with Provex</h1>
        <p className="mt-3 text-muted-foreground md:text-lg max-w-2xl">
          Verifiable provenance for files, datasets and AI models. Sign with an Aptos wallet,
          store on Shelby, anchor on-chain.
        </p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[260px_1fr] gap-6">
        <TOC />

        <div className="space-y-5 min-w-0">
          <Section id="overview" icon={Book} title="Overview">
            <p>
              Provex turns any file into a verifiable record. Three pieces work together:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Shelby</b> stores the raw bytes and returns a content-addressed Blob ID.</li>
              <li><b>Aptos</b> anchors the Blob ID, your wallet address, and an Ed25519 signature.</li>
              <li><b>Provex</b> ties them together with a public registry, explorer, and SDK.</li>
            </ul>
            <p>
              Anyone can fetch a Blob ID later, recompute its hash, and prove the file is the
              one your wallet signed.
            </p>
          </Section>

          <Section id="lifecycle" icon={Workflow} title="Attestation lifecycle">
            <ol className="list-decimal pl-5 space-y-2">
              <li><b>Hash locally</b>. The file is SHA-256 hashed in the browser. Bytes never leave unencrypted.</li>
              <li><b>Pay the upload fee</b>. Your wallet signs a 0.1 ShelbyUSDT fee receipt (see below).</li>
              <li><b>Sign the attestation</b>. The wallet signs a canonical message containing the Blob ID, filename, size, and uploader.</li>
              <li><b>Upload to Shelby</b>. Bytes are committed to Shelby storage providers; the returned Blob ID must equal the local hash.</li>
              <li><b>Anchor on Aptos</b>. <code>provex::registry::attest</code> records Blob ID, signature, public key, license, and lineage parents.</li>
            </ol>
          </Section>

          <Section id="fee" icon={Coins} title="Upload fee: 0.1 ShelbyUSDT">
            <p>
              Every upload requires a flat <b>0.1 ShelbyUSDT</b> base fee, regardless of file
              type or size. This funds Shelby storage providers and prevents spam in the
              public registry.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The fee is acknowledged with a wallet signature before the file is read.</li>
              <li>You will see a confirmation prompt in your wallet showing the exact amount.</li>
              <li>If you cancel, no bytes are uploaded and no on-chain transaction is sent.</li>
            </ul>
            <p>
              On testnet the fee is signed but not transferred so you can test end-to-end
              without spending real value.
            </p>
          </Section>

          <Section id="wallets" icon={Wallet} title="Supported wallets & network">
            <p>
              Provex uses the official <b>Aptos Wallet Adapter</b> (Aptos Wallet Kit). Any
              AIP-62 compatible wallet is auto-detected:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a className="text-primary hover:underline" href="https://petra.app" target="_blank" rel="noopener noreferrer">Petra</a></li>
              <li><a className="text-primary hover:underline" href="https://martianwallet.xyz" target="_blank" rel="noopener noreferrer">Martian</a></li>
              <li><a className="text-primary hover:underline" href="https://pontem.network/pontem-wallet" target="_blank" rel="noopener noreferrer">Pontem</a></li>
              <li>OKX, Nightly, and any other AIP-62 wallet</li>
            </ul>
            <div className="flex items-start gap-2 text-foreground/90">
              <Network className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>
                Your wallet must be on <b>Aptos Testnet</b>. The Dashboard will refuse uploads
                and prompt to switch networks if you are on Devnet or Mainnet.
              </p>
            </div>
          </Section>

          <Section id="downloads" icon={Download} title="Downloading uploaded files">
            <p>
              Yes - every uploaded file can be downloaded. Open <Link to="/explorer" className="text-primary hover:underline">Explorer</Link>, search by Blob ID,
              click the dataset, and use the <b>Download</b> button on the detail page.
            </p>
            <p>
              Permission rules:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Public datasets</b> (default) are downloadable by anyone with the Blob ID.</li>
              <li><b>Private datasets</b> require the uploader's wallet signature.</li>
              <li>The downloaded bytes are hashed client-side; if the SHA-256 does not match the Blob ID, the download is rejected.</li>
            </ul>
          </Section>

          <Section id="api-keys" icon={Key} title="What are API keys for?">
            <p>
              The wallet handles interactive uploads in the browser. API keys handle
              <b> server-to-server and CI/CD workflows</b> where no user is present to click
              a wallet prompt:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Backend services that attest files automatically (e.g. nightly data pipelines).</li>
              <li>GitHub Actions that stamp a build artifact when a release is cut.</li>
              <li>ML training jobs that register a model lineage proof when training finishes.</li>
              <li>Third-party apps that read the registry on behalf of a user.</li>
            </ul>
            <p>
              Each key is scoped, rotatable, and revocable from the <Link to="/api" className="text-primary hover:underline">API page</Link>.
              Keys never sign on-chain transactions on their own - they trigger an edge
              function that uses a delegated signer bound to your wallet.
            </p>
          </Section>

          <Section id="sdk" icon={Code2} title="SDK">
            <p>
              The <code>@provex/sdk</code> package wraps the same flow used by the web app.
              Install:
            </p>
            <Code>{`npm install @provex/sdk`}</Code>
            <p>Attest a file from Node.js:</p>
            <Code>{`import { Provex } from "@provex/sdk";

const px = new Provex({ apiKey: process.env.PROVEX_KEY });

const { blobId, signature, txHash } = await px.attest(fileBytes, {
  fileName: "training-set.parquet",
  license: "CC-BY-4.0",
  parents: [], // optional lineage
});

console.log("Verified:", blobId, "anchored at", txHash);`}</Code>
            <p>Verify any Blob ID:</p>
            <Code>{`const proof = await px.verify(blobId);
// { uploader, signature, publicKey, aptosTxHash, status }`}</Code>
          </Section>

          <Section id="models" icon={Bot} title="Models registry">
            <p>
              The <Link to="/models" className="text-primary hover:underline">Models page</Link> is where AI
              developers publish a verifiable trail for a trained model. Each model entry
              links to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The <b>training dataset Blob IDs</b> (lineage parents).</li>
              <li>The <b>model weights Blob ID</b> stored on Shelby.</li>
              <li>The <b>developer's wallet signature</b> and an optional attestation history.</li>
            </ul>
            <p>
              This lets downstream users prove a model was trained on consented data,
              which is what regulators, marketplaces, and auditors are starting to require.
            </p>
          </Section>

          <Section id="explorer" icon={GitBranch} title="Explorer & lineage">
            <p>
              The <Link to="/explorer" className="text-primary hover:underline">Explorer</Link> shows every
              public attestation as it lands. Search by Blob ID, wallet, or file name.
              Each dataset page renders the full lineage graph (parents and derivatives) so
              you can trace any model back to its source data.
            </p>
          </Section>

          <Section id="security" icon={ShieldCheck} title="Security model">
            <ul className="list-disc pl-5 space-y-1">
              <li>Files are hashed in the browser; raw bytes never reach Provex servers in clear text without your signature.</li>
              <li>The Aptos wallet is the only key holder. Provex never sees your private key.</li>
              <li>Edge functions validate signature shape and forward the canonical message to the Move module for full Ed25519 verification.</li>
              <li>API keys are stored hashed; only the prefix is recoverable after creation.</li>
            </ul>
          </Section>

          <Section id="faq" icon={AlertTriangle} title="FAQ">
            <p><b>What file types are supported?</b> Anything - images, video, audio, datasets, model weights, PDFs. Provex is content-agnostic.</p>
            <p><b>Is there a size limit?</b> Shelby supports multi-GB blobs; the web upload widget streams progress for large files.</p>
            <p><b>Can I delete a file?</b> You can revoke the on-chain attestation, but the Shelby blob remains addressable. Provenance is append-only by design.</p>
            <p><b>Why Aptos?</b> Sub-second finality, low fees, and native Ed25519 signing make per-file attestations economical.</p>
          </Section>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Docs;
