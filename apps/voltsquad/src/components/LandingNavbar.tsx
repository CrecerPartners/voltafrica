import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@digihire/shared";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@digihire/shared";
import { Menu, Zap, LayoutDashboard, Briefcase } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@digihire/shared";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center">
          <img src="/assets/logo-color.png" alt="DigiHire Logo" className="h-8 w-auto object-contain" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Events</Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Blog</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          
          <div className="flex items-center gap-3 ml-2">
            <a
              href="https://crecerpartners.com/sales/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Briefcase className="h-4 w-4 animate-bounce" />
              Hire Sales Executive
            </a>
            <CartDrawer />
            {isLoggedIn ? (
              <Button asChild className="volt-gradient border-0 font-semibold shadow-lg hover:opacity-90">
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="volt-gradient border-0 font-semibold shadow-lg hover:opacity-90">
                  <Link to="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <CartDrawer />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <Link to="/about" className="text-lg font-semibold text-foreground hover:text-primary transition-colors" onClick={() => setOpen(false)}>About</Link>
              <Link to="/events" className="text-lg font-semibold text-foreground hover:text-primary transition-colors" onClick={() => setOpen(false)}>Events</Link>
              <Link to="/blog" className="text-lg font-semibold text-foreground hover:text-primary transition-colors" onClick={() => setOpen(false)}>Blog</Link>
              <Link to="/contact" className="text-lg font-semibold text-foreground hover:text-primary transition-colors" onClick={() => setOpen(false)}>Contact</Link>
              
              <div className="h-px bg-border w-full my-2" />

              <a
                href="https://crecerpartners.com/sales/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Briefcase className="h-4 w-4 animate-bounce" />
                Hire Sales Executive
              </a>
              {isLoggedIn ? (
                <Button asChild className="w-full volt-gradient border-0 font-semibold" onClick={() => setOpen(false)}>
                  <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full" onClick={() => setOpen(false)}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full volt-gradient border-0 font-semibold" onClick={() => setOpen(false)}>
                    <Link to="/login">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
}


