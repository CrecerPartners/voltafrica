import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sales, dashboardStats, formatNaira, ProductCategory } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, TrendingUp, Star } from "lucide-react";

const statusColors: Record<string, string> = {
  confirmed: "text-success border-success/20",
  pending: "text-warning border-warning/20",
  cancelled: "text-destructive border-destructive/20",
};

const Sales = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = sales.filter(
    (s) => (statusFilter === "all" || s.status === statusFilter) && (categoryFilter === "all" || s.category === categoryFilter)
  );

  const topProduct = sales
    .filter((s) => s.status === "confirmed")
    .reduce((top, s) => (s.commission > (top?.commission || 0) ? s : top), sales[0]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Sales Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor all your attributed sales</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold font-display">{dashboardStats.totalSales}</p>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
            <p className="text-2xl font-bold font-display">{dashboardStats.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto text-warning mb-1" />
            <p className="text-sm font-bold font-display truncate">{topProduct?.product}</p>
            <p className="text-xs text-muted-foreground">Top Product</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "confirmed", "pending", "cancelled"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "volt-gradient" : ""}>
            {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
        <div className="border-l border-border mx-1" />
        {["all", "physical", "digital", "fintech", "events"].map((c) => (
          <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)}
            className={categoryFilter === c ? "volt-gradient" : ""}>
            {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
          </Button>
        ))}
      </div>

      {/* Sales Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sale) => (
                <TableRow key={sale.id} className="border-border/50">
                  <TableCell className="text-xs">{sale.date}</TableCell>
                  <TableCell className="font-medium text-sm">{sale.product}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{sale.customer}</TableCell>
                  <TableCell className="text-right text-sm">{sale.amount > 0 ? formatNaira(sale.amount) : "Free"}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-success">{formatNaira(sale.commission)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[sale.status]}>{sale.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
