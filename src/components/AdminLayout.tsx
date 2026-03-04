import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  GraduationCap,
  ArrowLeft,
  Star,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Sales", path: "/admin/sales", icon: ShoppingCart },
  { label: "Orders", path: "/admin/orders", icon: ClipboardList },
  { label: "Payouts", path: "/admin/payouts", icon: Wallet },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Verification", path: "/admin/verification", icon: ShieldCheck },
  { label: "Training", path: "/admin/training", icon: GraduationCap },
  { label: "Referrals", path: "/admin/referrals", icon: Users },
  { label: "Leaderboard", path: "/admin/leaderboard", icon: LayoutDashboard },
];

export function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-1">
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="flex flex-1 flex-col">
        <header className="md:hidden flex items-center gap-2 p-4 border-b bg-card overflow-x-auto">
          <Link to="/dashboard" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {navItems.map((item) => {
            const active = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
