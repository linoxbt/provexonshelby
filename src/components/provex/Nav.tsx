import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { ConnectWallet } from "./ConnectWallet";
import { WalletDiagnostics } from "./WalletDiagnostics";
import { MobileNav } from "./MobileNav";

const links = [
  { to: "/app", label: "Dashboard" },
  { to: "/explorer", label: "Explorer" },
  { to: "/models", label: "Models" },
  { to: "/simulation", label: "Simulation" },
  { to: "/api", label: "API" },
  { to: "/docs", label: "Docs" },
  { to: "/settings", label: "Settings" },
];

export const Nav = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link to="/" aria-label="Provex home" className="shrink-0"><Logo /></Link>
        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
          {links.slice(0, 5).map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-3 py-2 rounded-md transition-colors",
                pathname.startsWith(l.to)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <WalletDiagnostics />
          <ConnectWallet />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
};
