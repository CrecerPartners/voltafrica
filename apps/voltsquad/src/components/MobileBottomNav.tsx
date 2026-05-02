import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  BarChart3,
  MoreHorizontal,
  Calculator,
  Users,
  Trophy,
  User,
  LogOut,
  Zap,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useIsMobile } from "@digihire/shared";
import { useAuth } from "@digihire/shared";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@digihire/shared";

const primaryTabs = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "Market", path: "/marketplace", icon: ShoppingBag },
  { label: "Wallet", path: "/wallet", icon: Wallet },
  { label: "Sales", path: "/sales", icon: BarChart3 },
];

const moreTabs = [
  { label: "Calculator", path: "/calculator", icon: Calculator },
  { label: "Referrals", path: "/referrals", icon: Users },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Training", path: "/training", icon: GraduationCap },
  { label: "Settings", path: "/profile", icon: User },
];

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!isMobile) return null;

  const currentMoreTabs = [...moreTabs];
  if (isAdmin) {
    currentMoreTabs.unshift({ label: "Admin", path: "/admin", icon: ShieldCheck });
  }

  const isActive = (path: string) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
  const isMoreActive = currentMoreTabs.some((t) => isActive(t.path));

  const handleNav = (path: string) => {
    navigate(path);
    setMoreOpen(false);
  };

  const handleLogout = async () => {
    setMoreOpen(false);
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/80 backdrop-blur-xl border-t border-border safe-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {primaryTabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => handleNav(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-150 active:scale-90 ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <tab.icon
                  className={`h-5 w-5 transition-all duration-150 ${
                    active ? "stroke-[2.5]" : "stroke-[1.5]"
                  }`}
                />
                <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-150 active:scale-90 ${
              isMoreActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal
              className={`h-5 w-5 transition-all duration-150 ${
                isMoreActive ? "stroke-[2.5]" : "stroke-[1.5]"
              }`}
            />
            <span className={`text-[10px] leading-tight ${isMoreActive ? "font-semibold" : "font-medium"}`}>
              More
            </span>
            {isMoreActive && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* More Drawer */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2 justify-center">
              <img src="/assets/logo-color.png" alt="DigiHire Logo" className="h-6 w-auto object-contain" />
              <span className="font-display font-bold">More</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 grid grid-cols-4 gap-3 text-center">
            {currentMoreTabs.map((tab) => {
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.path}
                  onClick={() => handleNav(tab.path)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-150 active:scale-95 ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-xl p-3 text-destructive bg-destructive/10 transition-all duration-150 active:scale-95"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}


