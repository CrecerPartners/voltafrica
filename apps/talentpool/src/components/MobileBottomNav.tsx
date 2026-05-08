import { useLocation, useNavigate } from "react-router-dom";
import { UserCircle, Settings, GraduationCap, LogOut } from "lucide-react";
import { useIsMobile, useAuth } from "@digihire/shared";

const tabs = [
  { label: "Profile", path: "/talent", icon: UserCircle, exact: true },
  { label: "Academy", path: "/academy", icon: GraduationCap, exact: false },
  { label: "Settings", path: "/talent/setup", icon: Settings, exact: false },
];

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  if (!isMobile) return null;

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/80 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path, tab.exact);
          return (
            <button
              type="button"
              key={tab.path}
              onClick={() => navigate(tab.path)}
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
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-muted-foreground transition-all duration-150 active:scale-90"
        >
          <LogOut className="h-5 w-5 stroke-[1.5]" />
          <span className="text-[10px] leading-tight font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
