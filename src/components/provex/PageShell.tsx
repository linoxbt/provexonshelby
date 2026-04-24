import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { BackButton } from "./BackButton";

export const PageShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const showBack = pathname !== "/";
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      {showBack && (
        <div className="container pt-5">
          <BackButton />
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
