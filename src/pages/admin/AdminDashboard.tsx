import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminUsers, useAdminSales, useAdminPayouts, useAdminTransactions } from "@/hooks/useAdminData";
import { Users, ShoppingCart, Wallet, TrendingUp, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: users } = useAdminUsers();
  const { data: sales } = useAdminSales();
  const { data: payouts } = useAdminPayouts();
  const { data: transactions } = useAdminTransactions();

  const totalUsers = users?.length ?? 0;
  const totalSales = sales?.length ?? 0;
  const pendingSales = sales?.filter((s) => s.status === "pending").length ?? 0;
  const pendingPayouts = payouts?.filter((p) => p.status === "pending").length ?? 0;
  const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.amount), 0) ?? 0;
  const totalCommissions = transactions?.filter(t => t.status === "paid").reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const cards = [
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Total Sales", value: totalSales, icon: ShoppingCart },
    { label: "Pending Sales", value: pendingSales, icon: Clock },
    { label: "Pending Payouts", value: pendingPayouts, icon: Wallet },
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp },
    { label: "Commissions Paid", value: `₦${totalCommissions.toLocaleString()}`, icon: TrendingUp },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
