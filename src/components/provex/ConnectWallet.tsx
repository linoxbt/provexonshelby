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
import { Wallet, LogOut, Copy } from "lucide-react";
import { toast } from "sonner";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const ConnectWallet = ({ size = "sm" as const }) => {
  const { connect, disconnect, account, connected, wallets } = useWallet();

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
            Choose wallet
          </DropdownMenuLabel>
          {wallets?.map((w) => (
            <DropdownMenuItem
              key={w.name}
              onClick={() => connect(w.name)}
              className="cursor-pointer"
            >
              {w.icon && (
                <img src={w.icon} alt="" className="h-4 w-4 mr-2 rounded-sm" />
              )}
              {w.name}
            </DropdownMenuItem>
          ))}
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
