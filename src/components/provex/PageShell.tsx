import { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export const PageShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Nav />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
