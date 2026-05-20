import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { pushDiag, SHELBY_HANDSHAKE_MESSAGE } from "@/lib/walletDiagnostics";
import { useAptosNetwork, REQUIRED_NETWORK } from "@/hooks/useAptosNetwork";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const preferredWallets = ["Petra", "Pontem", "Martian"];
const installUrls: Record<string, string> = {
  Petra: "https://petra.app/",
  Pontem: "https://pontem.network/pontem-wallet",
  Martian: "https://martianwallet.xyz/",
};

export const ConnectWallet = ({ size = "sm" as const }) => {
  const { connect, disconnect, account, connected, wallets, notDetectedWallets, isLoading, signMessage, wallet } = useWallet();
  const { isCorrect, current, switchToTestnet } = useAptosNetwork();
  const [handshakeOk, setHandshakeOk] = useState(false);

  const detected = preferredWallets
    .map((name) => wallets?.find((w) => w.name === name))
    .filter(Boolean) as NonNullable<typeof wallets>[number][];

  const installOnly = preferredWallets.filter(
    (name) => !detected.some((w) => w.name === name)
  );

  const otherDetected = (wallets ?? []).filter(
    (w) => !preferredWallets.includes(w.name) && !w.name.startsWith("Continue with")
  );

  // Reset handshake whenever wallet/account changes
  useEffect(() => {
    setHandshakeOk(false);
  }, [account?.address?.toString(), wallet?.name]);

  // Run the Shelby-compatible signing handshake once connected and on testnet
  useEffect(() => {
    if (!connected || !account || !signMessage || handshakeOk) return;
    if (!isCorrect) return; // wait for testnet
    (async () => {
      try {
        pushDiag({ level: "info", source: "handshake", message: "Requesting Shelby signing handshake…" });
        const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
        const res: any = await signMessage({ message: SHELBY_HANDSHAKE_MESSAGE, nonce });
        if (res?.signature) {
          setHandshakeOk(true);
          pushDiag({ level: "info", source: "handshake", message: "Shelby handshake signature accepted." });
          toast.success("Shelby signing enabled");
        }
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        pushDiag({ level: "error", source: "handshake", message: msg });
        if (!msg.toLowerCase().includes("user rejected")) toast.error(msg);
      }
    })();
  }, [connected, account, signMessage, isCorrect, handshakeOk]);

  const onConnect = async (name: string) => {
    try {
      pushDiag({ level: "info", source: "connect", message: `Requesting connection to ${name}…` });
      await connect(name);
      pushDiag({ level: "info", source: "connect", message: `${name} returned an account.` });
      toast.success(`${name} connected`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      pushDiag({ level: "error", source: "connect", message: `${name}: ${msg}` });
      if (!msg.toLowerCase().includes("user rejected")) toast.error(msg);
    }
  };

  if (!connected || !account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={size} className="bg-gradient-primary text-primary-foreground shadow-glow shrink-0">
            <Wallet className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Connect Wallet</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Aptos + Shelby wallet
          </DropdownMenuLabel>
          {detected.length === 0 && installOnly.length === preferredWallets.length && (
            <div className="px-2 py-2 text-xs text-muted-foreground">
              No wallets detected. Install one below or check the Diagnostics panel.
            </div>
          )}
          {detected.map((w) => (
            <DropdownMenuItem key={w.name} onClick={() => onConnect(w.name)} className="cursor-pointer">
              {w.icon && <img src={w.icon} alt="" className="h-4 w-4 mr-2 rounded-sm" />}
              {w.name}
              {isLoading && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
            </DropdownMenuItem>
          ))}
          {otherDetected.length > 0 && <DropdownMenuSeparator />}
          {otherDetected.map((w) => (
            <DropdownMenuItem key={w.name} onClick={() => onConnect(w.name)} className="cursor-pointer">
              {w.icon && <img src={w.icon} alt="" className="h-4 w-4 mr-2 rounded-sm" />}
              {w.name}
            </DropdownMenuItem>
          ))}
          {installOnly.length > 0 && <DropdownMenuSeparator />}
          {installOnly.map((name) => {
            const registered = notDetectedWallets?.find((w) => w.name === name);
            return (
              <DropdownMenuItem key={name} asChild>
                <a href={registered?.url ?? installUrls[name]} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  {registered?.icon && <img src={registered.icon} alt="" className="h-4 w-4 mr-2 rounded-sm" />}
                  Install {name}
                  <ExternalLink className="ml-auto h-3.5 w-3.5" />
                </a>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const addr = account.address.toString();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant="outline" className="bg-card/40 font-mono text-xs">
          <span className={`h-1.5 w-1.5 rounded-full mr-2 ${isCorrect && handshakeOk ? "bg-accent" : "bg-primary"}`} />
          {short(addr)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Connected wallet
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 font-mono text-[11px] break-all">{addr}</div>
        <div className="px-2 py-1.5 text-[11px] flex items-center gap-2">
          {isCorrect ? (
            <><ShieldCheck className="h-3.5 w-3.5 text-accent" /><span>Network · {current}</span></>
          ) : (
            <><AlertTriangle className="h-3.5 w-3.5 text-primary" /><span>Switch to {REQUIRED_NETWORK} for Shelby</span></>
          )}
        </div>
        <div className="px-2 py-1.5 text-[11px] flex items-center gap-2">
          {handshakeOk ? (
            <><ShieldCheck className="h-3.5 w-3.5 text-accent" /><span>Shelby handshake signed</span></>
          ) : (
            <><AlertTriangle className="h-3.5 w-3.5 text-primary" /><span>Shelby handshake pending</span></>
          )}
        </div>
        <DropdownMenuSeparator />
        {!isCorrect && (
          <DropdownMenuItem onClick={switchToTestnet}>
            Switch network to {REQUIRED_NETWORK}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(addr);
            toast.success("Address copied");
          }}
        >
          <Copy className="h-4 w-4 mr-2" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut className="h-4 w-4 mr-2" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
