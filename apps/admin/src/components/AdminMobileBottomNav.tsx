import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  MoreHorizontal,
  ShoppingCart,
  Wallet,
  Star,
  ShieldCheck,
  GraduationCap,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { useIsMobile } from "@digihire/shared";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@digihire/shared";

const primaryTabs = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Sales", path: "/admin/sales", icon: ShoppingCart },
];

const moreTabs = [
  { label: "Orders", path: "/admin/orders", icon: ClipboardList },
  { label: "Payouts", path: "/admin/payouts", icon: Wallet },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Verify", path: "/admin/verification", icon: ShieldCheck },
  { label: "Training", path: "/admin/training", icon: GraduationCap },
  { label: "Referrals", path: "/admin/referrals", icon: Users },
  { label: "Leaderboard", path: "/admin/leaderboard", icon: Trophy },
];

export function AdminMobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!isMobile) return null;

  const isActive = (path: string) => {
    return location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
  };

  const isMoreActive = moreTabs.some((tab) => isActive(tab.path));

  const handleNav = (path: string) => {
    navigate(path);
    setMoreOpen(false);
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
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className={`h-5 w-5 transition-all duration-150 ${active ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                <span className={`text-[10px] leading-tight ${active ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-150 active:scale-90 ${
              isMoreActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal className={`h-5 w-5 transition-all duration-150 ${isMoreActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            <span className={`text-[10px] leading-tight ${isMoreActive ? "font-semibold" : "font-medium"}`}>More</span>
            {isMoreActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
          </button>
        </div>
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2 justify-center">
              <span className="font-bold">DigiHire Admin</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 grid grid-cols-4 gap-3 text-center">
            {moreTabs.map((tab) => {
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.path}
                  onClick={() => handleNav(tab.path)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-150 active:scale-95 ${
                    active ? "bg-primary/10 text-primary" : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}


