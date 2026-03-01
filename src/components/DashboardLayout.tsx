import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export function DashboardLayout() {
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();

  const initials = (profile?.name || "?").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              {/* Mobile: Volt logo — Desktop: sidebar trigger */}
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg volt-gradient">
                    <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold font-display text-foreground">Volt</span>
                </div>
              ) : (
                <SidebarTrigger />
              )}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-card" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/20 text-sm font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Logout button — desktop only */}
              {!isMobile && (
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
            <div key={location.pathname} className="animate-page-in">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
