import logo from "@/assets/provex-logo.png";

export const Logo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <div className="flex items-center gap-2">
    <img src={logo} alt="Provex logo" className={className} width={32} height={32} />
    <span className="font-semibold tracking-tight text-lg">Provex</span>
  </div>
);
