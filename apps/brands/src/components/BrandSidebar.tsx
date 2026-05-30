import { useState } from "react";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Zap,
  BarChart3,
  Target,
  Lock,
  Settings,
  LogOut,
  Briefcase,
  Unlock,
  Loader2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@digihire/shared";
import { useAuth, supabase as _supabase } from "@digihire/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@digihire/shared";
import { Button } from "@digihire/shared";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@digihire/shared";

const supabase = _supabase as any;

type ModuleKey = 'voltsquad' | 'recruitment' | 'activations';

const MODULE_INFO: Record<ModuleKey, {
  label: string;
  icon: React.FC<{ className?: string }>;
  pitch: string;
  benefit: string;
}> = {
  voltsquad: {
    label: 'VoltSquad Campaigns',
    icon: Megaphone,
    pitch: 'Deploy a network of trained sellers to promote your products and track performance in real time.',
    benefit: 'Set commissions, monitor conversions, and scale your sales reach instantly.',
  },
  recruitment: {
    label: 'Sales Recruitment',
    icon: Users,
    pitch: 'Request pre-vetted sales professionals matched to your exact role requirements.',
    benefit: 'We source, screen, and shortlist candidates — you just interview.',
  },
  activations: {
    label: 'Field Activations',
    icon: Zap,
    pitch: 'Book trained activation staff for on-ground brand activations and field marketing events.',
    benefit: 'Get boots on the ground for pop-ups, product demos, and trade shows.',
  },
};

const navItems = [
  { label: "Overview", path: "/brand", icon: LayoutDashboard, exact: true, module: null as ModuleKey | null },
  { label: "Campaigns", path: "/brand/campaigns", icon: Megaphone, exact: false, module: 'voltsquad' as ModuleKey },
  { label: "Job Listings", path: "/brand/jobs", icon: Briefcase, exact: false, module: null as ModuleKey | null },
  { label: "Recruitment", path: "/brand/recruitment", icon: Users, exact: false, module: 'recruitment' as ModuleKey },
  { label: "Activations", path: "/brand/activations", icon: Zap, exact: false, module: 'activations' as ModuleKey },
  { label: "Reports", path: "/brand/reports", icon: BarChart3, exact: false, module: null as ModuleKey | null },
  { label: "Company Profile", path: "/brand/setup", icon: Target, exact: false, module: null as ModuleKey | null },
];

export function BrandSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [unlockTarget, setUnlockTarget] = useState<ModuleKey | null>(null);
  const [activating, setActivating] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const activeModules: string[] = (user?.user_metadata?.active_modules as string[] | undefined) ?? [];
  const isModuleActive = (mod: ModuleKey | null) => mod === null || activeModules.includes(mod);

  const isActive = (path: string, exact: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path) && location.pathname !== "/brand";

  const handleActivate = async () => {
    if (!unlockTarget) return;
    setActivating(true);
    try {
      await supabase.auth.updateUser({
        data: { active_modules: [...activeModules, unlockTarget] },
      });
      const targetPath = navItems.find(n => n.module === unlockTarget)?.path;
      setUnlockTarget(null);
      if (targetPath) navigate(targetPath);
    } finally {
      setActivating(false);
    }
  };

  const unlockInfo = unlockTarget ? MODULE_INFO[unlockTarget] : null;

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 overflow-hidden h-8">
            <img
              src="/assets/logo-color.png"
              alt="DigiHire"
              className={cn(
                "h-8 object-contain transition-all duration-300",
                collapsed ? "w-8 object-left" : "w-auto"
              )}
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const unlocked = isModuleActive(item.module);

                  if (!unlocked) {
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          tooltip={`${item.label} — click to activate`}
                          onClick={() => item.module && setUnlockTarget(item.module)}
                          className="opacity-50 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <div className="relative">
                            <item.icon className="h-4 w-4" />
                            <Lock className="h-2.5 w-2.5 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                          </div>
                          {!collapsed && (
                            <span className="flex items-center gap-1.5">
                              {item.label}
                              <Lock className="h-3 w-3 text-muted-foreground/70" />
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.path, item.exact)}
                        tooltip={item.label}
                      >
                        <NavLink
                          to={item.path}
                          end={item.exact}
                          className="hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith('/brand/settings')}
                tooltip="Settings"
              >
                <NavLink
                  to="/brand/settings"
                  className="hover:bg-sidebar-accent"
                  activeClassName="bg-sidebar-accent text-primary font-medium"
                >
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                tooltip="Sign Out"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Module unlock dialog */}
      <Dialog open={!!unlockTarget} onOpenChange={open => { if (!open) setUnlockTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {unlockInfo && <unlockInfo.icon className="h-5 w-5 text-primary" />}
              </div>
              <DialogTitle className="text-base">{unlockInfo?.label}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <p className="text-sm text-muted-foreground leading-relaxed">{unlockInfo?.pitch}</p>

            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-xs font-semibold text-primary mb-1">What you get</p>
              <p className="text-sm text-foreground">{unlockInfo?.benefit}</p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUnlockTarget(null)}
                disabled={activating}
              >
                Maybe later
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleActivate}
                disabled={activating}
              >
                {activating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Activating…</>
                  : <><Unlock className="h-4 w-4" /> Activate</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
