import { PageShell } from "@/components/provex/PageShell";
import { Button } from "@/components/ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAptosNetwork, REQUIRED_NETWORK } from "@/hooks/useAptosNetwork";
import { shortAddr } from "@/lib/provex";
import { toast } from "sonner";
import { RefreshCw, LogOut } from "lucide-react";

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{k}</span>
    <span className="font-mono text-sm text-right break-all">{v}</span>
  </div>
);

const Settings = () => {
  const { connected, account, wallet, disconnect } = useWallet();
  const { current, isCorrect, switchToTestnet } = useAptosNetwork();
  const addr = account?.address?.toString();

  return (
    <PageShell>
      <section className="container py-12 max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Settings</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Account & network</h1>

        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="font-semibold">Wallet</h3>
          <div className="mt-3">
            <Row k="Status" v={connected ? "Connected" : "Disconnected"} />
            <Row k="Adapter" v={wallet?.name ?? "—"} />
            <Row k="Address" v={addr ? <button onClick={() => { navigator.clipboard.writeText(addr); toast.success("Copied"); }} className="hover:text-primary">{shortAddr(addr)}</button> : "—"} />
            <Row k="Network" v={<span className={isCorrect ? "text-accent" : "text-primary"}>{current ?? "—"} (required: {REQUIRED_NETWORK})</span>} />
          </div>
          {connected && !isCorrect && (
            <Button onClick={switchToTestnet} className="mt-4"><RefreshCw className="h-4 w-4 mr-1.5" /> Switch to {REQUIRED_NETWORK}</Button>
          )}
          {connected && (
            <Button variant="outline" onClick={() => disconnect()} className="mt-4 ml-2"><LogOut className="h-4 w-4 mr-1.5" /> Disconnect</Button>
          )}
        </div>

        <div className="mt-6 glass rounded-2xl p-6">
          <h3 className="font-semibold">Preferences</h3>
          <p className="mt-2 text-sm text-muted-foreground">Provex stores no off-chain user preferences yet — all account state derives from your wallet and on-chain attestations.</p>
        </div>
      </section>
    </PageShell>
  );
};

export default Settings;
