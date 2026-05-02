import { Outlet } from "react-router-dom";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function PublicProductLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 font-display font-bold text-foreground hover:opacity-80 transition-opacity">
          <div className="flex h-5 w-5 items-center justify-center rounded volt-gradient">
            <Zap className="h-3 w-3 text-primary-foreground" />
          </div>
          DigiHire
        </Link>
        <p className="mt-1">© {new Date().getFullYear()} DigiHire. All rights reserved.</p>
      </footer>
    </div>
  );
}


