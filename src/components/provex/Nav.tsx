import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/app", label: "Dashboard" },
  { to: "/explorer", label: "Explorer" },
  { to: "/api", label: "API" },
];

export const Nav = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" aria-label="Provex home"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
          {links.map(l => (
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
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/explorer">Explore</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Link to="/app">Launch App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
