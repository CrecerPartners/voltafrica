import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Users,
  BarChart3,
  Trophy,
  User,
  Zap,
  Calculator,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Calculator", url: "/calculator", icon: Calculator },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Referrals", url: "/referrals", icon: Users },
  { title: "Sales", url: "/sales", icon: BarChart3 },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Settings", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg volt-gradient">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold font-display text-foreground">
              Volt
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-xs text-muted-foreground">Powered by</p>
            <p className="text-sm font-semibold font-display text-primary">Volt ⚡</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
