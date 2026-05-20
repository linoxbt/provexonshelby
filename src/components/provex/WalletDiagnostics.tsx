import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { clearDiag, useDiagnostics } from "@/lib/walletDiagnostics";
import { useAptosNetwork } from "@/hooks/useAptosNetwork";

const Row = ({ label, value, ok }: { label: string; value: string; ok?: boolean }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-border/60 last:border-0">
    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
    <span className={`font-mono text-xs text-right break-all ${ok === false ? "text-destructive" : ok ? "text-accent" : "text-foreground"}`}>
      {value}
    </span>
  </div>
);

export const WalletDiagnostics = () => {
  const { connected, account, wallet, wallets, notDetectedWallets, isLoading } = useWallet();
  const { current, required, isCorrect, switchToTestnet } = useAptosNetwork();
  const diag = useDiagnostics();
  const [open, setOpen] = useState(false);

  const detected = wallets ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="bg-card/40">
          <Activity className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Diagnostics</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Wallet diagnostics</SheetTitle>
        </SheetHeader>

        <div className="mt-6 glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2">Connection</h4>
          <Row label="Status" value={isLoading ? "loading…" : connected ? "connected" : "disconnected"} ok={connected} />
          <Row label="Adapter" value={wallet?.name ?? "—"} />
          <Row label="Address" value={account?.address?.toString() ?? "—"} />
          <Row
            label="Network"
            value={connected ? `${current ?? "unknown"} (required: ${required})` : "—"}
            ok={connected ? isCorrect : undefined}
          />
          {connected && !isCorrect && (
            <Button size="sm" className="mt-3 w-full" onClick={switchToTestnet}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Switch to {required}
            </Button>
          )}
        </div>

        <div className="mt-4 glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2">Detected wallets ({detected.length})</h4>
          {detected.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No AIP-62 wallets detected in this browser. Install Petra, Martian, or Pontem and reload.
            </p>
          )}
          <ul className="space-y-1">
            {detected.map((w) => (
              <li key={w.name} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span className="font-mono">{w.name}</span>
                {wallet?.name === w.name && <span className="text-accent">· active</span>}
              </li>
            ))}
          </ul>
          {(notDetectedWallets?.length ?? 0) > 0 && (
            <>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Not detected</div>
              <ul className="space-y-1 mt-1">
                {notDetectedWallets!.map((w) => (
                  <li key={w.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5" />
                    <span className="font-mono">{w.name}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mt-4 glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Event log</h4>
            <Button size="sm" variant="ghost" onClick={clearDiag}>Clear</Button>
          </div>
          {diag.length === 0 ? (
            <p className="text-xs text-muted-foreground">No wallet events yet. Try clicking Connect.</p>
          ) : (
            <ul className="space-y-2">
              {diag.map((e) => (
                <li key={e.id} className="text-xs border-l-2 pl-2 break-words"
                    style={{ borderColor: e.level === "error" ? "hsl(var(--destructive))" : e.level === "warn" ? "hsl(var(--primary))" : "hsl(var(--accent))" }}>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {new Date(e.ts).toLocaleTimeString()} · {e.source} · {e.level}
                  </div>
                  <div className="mt-0.5">{e.message}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-border/60 p-3 text-xs text-muted-foreground flex gap-2">
          <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          If Connect appears to do nothing, check this panel for adapter errors (most often: extension locked, popup blocked, or wrong network).
        </div>
      </SheetContent>
    </Sheet>
  );
};
