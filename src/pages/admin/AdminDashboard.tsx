import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminUsers, useAdminSales, useAdminPayouts, useAdminTransactions, useAdminProducts } from "@/hooks/useAdminData";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { Users, ShoppingCart, Wallet, TrendingUp, Clock, AlertTriangle, ArrowRight, Star, ShieldCheck, ClipboardList, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

export default function AdminDashboard() {
  const { data: users } = useAdminUsers();
  const { data: sales } = useAdminSales();
  const { data: payouts } = useAdminPayouts();
  const { data: transactions } = useAdminTransactions();
  const { data: products } = useAdminProducts();
  const { data: reviews } = useAdminReviews();
  const { data: orders } = useAdminOrders();

  const totalUsers = users?.length ?? 0;
  const totalSales = sales?.length ?? 0;
  const pendingSales = sales?.filter((s) => s.status === "pending").length ?? 0;
  const pendingPayouts = payouts?.filter((p) => p.status === "pending").length ?? 0;
  const totalRevenue = sales?.filter(s => s.status === "confirmed").reduce((sum, s) => sum + Number(s.amount), 0) ?? 0;
  const totalCommissions = transactions?.filter(t => t.status === "paid").reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  const pendingVerifications = users?.filter((u) => u.verification_status === "pending").length ?? 0;
  const totalReviews = reviews?.length ?? 0;
  const totalOrders = orders?.length ?? 0;
  const verifiedLeads = sales?.filter((s: any) => s.conversion_status === "verified").length ?? 0;

  // Product type breakdown
  const productTypeCounts = useMemo(() => {
    const counts = { physical: 0, digital: 0, lead: 0 };
    products?.forEach((p: any) => {
      const t = p.product_type as keyof typeof counts;
      if (t in counts) counts[t]++;
    });
    return counts;
  }, [products]);

  // Tier distribution
  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
    users?.forEach((u) => { counts[u.tier] = (counts[u.tier] || 0) + 1; });
    return counts;
  }, [users]);

  // Revenue chart - last 30 days
  const chartData = useMemo(() => {
    if (!sales) return [];
    const now = new Date();
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    sales.filter(s => s.status === "confirmed").forEach((s) => {
      const key = s.date?.slice(0, 10);
      if (key && key in days) days[key] += Number(s.amount);
    });
    return Object.entries(days).map(([date, amount]) => ({
      date: date.slice(5), // MM-DD
      amount,
    }));
  }, [sales]);

  // Recent activity
  const recentSales = sales?.slice(0, 5) ?? [];
  const recentUsers = users?.slice(0, 5) ?? [];

  const cards = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Sales", value: totalSales, icon: ShoppingCart, color: "text-green-500" },
    { label: "Pending Sales", value: pendingSales, icon: Clock, color: "text-yellow-500" },
    { label: "Pending Payouts", value: pendingPayouts, icon: Wallet, color: "text-orange-500" },
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Commissions Paid", value: `₦${totalCommissions.toLocaleString()}`, icon: TrendingUp, color: "text-purple-500" },
    { label: "Pending Verifications", value: pendingVerifications, icon: ShieldCheck, color: "text-cyan-500" },
    { label: "Total Reviews", value: totalReviews, icon: Star, color: "text-pink-500" },
    { label: "Total Orders", value: totalOrders, icon: ClipboardList, color: "text-indigo-500" },
    { label: "Verified Leads", value: verifiedLeads, icon: Package, color: "text-teal-500" },
  ];

  const hasPendingAlerts = pendingSales > 0 || pendingPayouts > 0 || pendingVerifications > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>

      {/* Pending alerts */}
      {hasPendingAlerts && (
        <div className="flex flex-wrap gap-3">
          {pendingSales > 0 && (
            <Link to="/admin/sales">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {pendingSales} sale{pendingSales > 1 ? "s" : ""} pending review
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          )}
          {pendingPayouts > 0 && (
            <Link to="/admin/payouts">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {pendingPayouts} payout{pendingPayouts > 1 ? "s" : ""} pending
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          )}
          {pendingVerifications > 0 && (
            <Link to="/admin/verification">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-sm">
                <ShieldCheck className="h-4 w-4" />
                {pendingVerifications} verification{pendingVerifications > 1 ? "s" : ""} pending
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product type breakdown */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
          <Package className="h-3.5 w-3.5" /> Physical: <span className="font-semibold">{productTypeCounts.physical}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
          <Package className="h-3.5 w-3.5" /> Digital: <span className="font-semibold">{productTypeCounts.digital}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
          <Package className="h-3.5 w-3.5" /> Lead: <span className="font-semibold">{productTypeCounts.lead}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link to="/admin/sales"><Button variant="outline" size="sm">Review Sales</Button></Link>
        <Link to="/admin/payouts"><Button variant="outline" size="sm">Process Payouts</Button></Link>
        <Link to="/admin/orders"><Button variant="outline" size="sm">Manage Orders</Button></Link>
        <Link to="/admin/verification"><Button variant="outline" size="sm">Verifications</Button></Link>
        <Link to="/admin/reviews"><Button variant="outline" size="sm">Moderate Reviews</Button></Link>
        <Link to="/admin/products"><Button variant="outline" size="sm">Manage Products</Button></Link>
        <Link to="/admin/users"><Button variant="outline" size="sm">Manage Users</Button></Link>
        <Link to="/admin/training"><Button variant="outline" size="sm">Training Content</Button></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₦${v.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tier distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">User Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tierCounts).map(([tier, count]) => {
                const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                const colors: Record<string, string> = {
                  Bronze: "bg-orange-400",
                  Silver: "bg-gray-400",
                  Gold: "bg-yellow-400",
                  Platinum: "bg-blue-400",
                };
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{tier}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[tier] || "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
            <Link to="/admin/sales" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSales.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.customer}</p>
                    <p className="text-xs text-muted-foreground">{s.products?.name ?? "Unknown product"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₦{Number(s.amount).toLocaleString()}</p>
                    <p className={`text-xs ${s.status === "pending" ? "text-yellow-600" : s.status === "confirmed" ? "text-green-600" : "text-red-600"}`}>{s.status}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Link to="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{u.name?.charAt(0) || "?"}</div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.university}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {recentUsers.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
