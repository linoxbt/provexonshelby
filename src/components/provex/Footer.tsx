import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-border/60 mt-24">
    <div className="container py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-md">
          The notary layer for Web3 data.
        </p>
      </div>
      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} Provex Labs · Verifiable by design
      </div>
    </div>
  </footer>
);
