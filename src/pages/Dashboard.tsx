import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  currentUser,
  dashboardStats,
  earningsData,
  recentActivity,
  formatNaira,
} from "@/data/mockData";
import {
  TrendingUp,
  Clock,
  ShoppingCart,
  Users,
  Copy,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Earnings", value: formatNaira(dashboardStats.totalEarnings), icon: TrendingUp, trend: `+${dashboardStats.weeklyGrowth}%` },
    { label: "Pending Payout", value: formatNaira(dashboardStats.pendingPayout), icon: Clock },
    { label: "Total Sales", value: dashboardStats.totalSales.toString(), icon: ShoppingCart },
    { label: "Referrals", value: dashboardStats.referralCount.toString(), icon: Users },
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">
          Welcome back, {currentUser.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's how you're doing this week</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                {stat.trend && (
                  <span className="text-xs font-medium text-success">{stat.trend}</span>
                )}
              </div>
              <p className="text-xl md:text-2xl font-bold font-display">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Earnings Chart */}
        <Card className="lg:col-span-3 border-border/50">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-sm font-semibold mb-4">Earnings Trend</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(207 90% 54%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(207 90% 54%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                  <XAxis dataKey="week" stroke="hsl(0 0% 55%)" fontSize={12} />
                  <YAxis stroke="hsl(0 0% 55%)" fontSize={12} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(0 0% 55%)" }}
                    formatter={(value: number) => [formatNaira(value), "Earnings"]}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="hsl(207 90% 54%)" fill="url(#blueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <span className="text-success font-semibold ml-2">+{formatNaira(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button onClick={copyReferralCode} variant="outline" className="h-auto py-3 justify-start gap-3">
          <Copy className="h-4 w-4 text-primary" />
          <div className="text-left">
            <p className="font-medium text-sm">Copy Referral Code</p>
            <p className="text-xs text-muted-foreground">{currentUser.referralCode}</p>
          </div>
        </Button>
        <Button onClick={() => navigate("/marketplace")} variant="outline" className="h-auto py-3 justify-start gap-3">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <div className="text-left">
            <p className="font-medium text-sm">Browse Products</p>
            <p className="text-xs text-muted-foreground">Find offers to promote</p>
          </div>
        </Button>
        <Button onClick={() => navigate("/wallet")} variant="outline" className="h-auto py-3 justify-start gap-3">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="text-left">
            <p className="font-medium text-sm">View Wallet</p>
            <p className="text-xs text-muted-foreground">{formatNaira(dashboardStats.pendingPayout)} pending</p>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
