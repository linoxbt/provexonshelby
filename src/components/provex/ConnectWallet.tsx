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
import { Wallet, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const preferredWallets = ["Petra", "Pontem", "Martian"];
const installUrls: Record<string, string> = {
  Petra: "https://petra.app/",
  Pontem: "https://pontem.network/pontem-wallet",
  Martian: "https://martianwallet.xyz/",
};

export const ConnectWallet = ({ size = "sm" as const }) => {
  const { connect, disconnect, account, connected, wallets, notDetectedWallets, isLoading } = useWallet();

  const detected = preferredWallets
    .map((name) => wallets?.find((w) => w.name === name))
    .filter(Boolean) as NonNullable<typeof wallets>[number][];

  const installOnly = preferredWallets.filter(
    (name) => !detected.some((w) => w.name === name)
  );

  const otherDetected = (wallets ?? []).filter(
    (w) => !preferredWallets.includes(w.name) && !w.name.startsWith("Continue with")
  );

  const onConnect = async (name: string) => {
    try {
      await connect(name);
      toast.success(`${name} connected for Aptos + Shelby signing`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Aptos + Shelby wallet
          </DropdownMenuLabel>
          {detected.map((w) => (
            <DropdownMenuItem
              key={w.name}
              onClick={() => onConnect(w.name)}
              className="cursor-pointer"
            >
              {w.icon && (
                <img src={w.icon} alt="" className="h-4 w-4 mr-2 rounded-sm" />
              )}
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
          <span className="h-1.5 w-1.5 rounded-full bg-accent mr-2" />
          {short(addr)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Connected wallet
        </DropdownMenuLabel>
        <div className="px-2 py-1.5 font-mono text-[11px] break-all">{addr}</div>
        <DropdownMenuSeparator />
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
