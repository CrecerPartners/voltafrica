import { SidebarProvider, SidebarTrigger, SidebarInset, Avatar, AvatarFallback } from "@digihire/shared";
import { useIsMobile, useAuth } from "@digihire/shared";
import { TalentSidebar } from "@/components/TalentSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const initials = (user?.user_metadata?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <SidebarProvider>
      <TalentSidebar />
      <SidebarInset>
        <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Link to="/talent" className="flex items-center">
                <img
                  src="/assets/logo-color.png"
                  alt="DigiHire"
                  className="h-7 w-auto object-contain"
                />
              </Link>
            ) : (
              <SidebarTrigger />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-foreground">
                {user?.user_metadata?.name || user?.email}
              </span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">talent</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>

        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
