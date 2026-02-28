import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSales } from "@/hooks/useSales";
import { formatNaira } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, TrendingUp, Star, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  confirmed: "text-success border-success/20",
  pending: "text-warning border-warning/20",
  cancelled: "text-destructive border-destructive/20",
};

const Sales = () => {
  const { data: sales = [], isLoading } = useSales();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = sales.filter(
    (s) => (statusFilter === "all" || s.status === statusFilter) && (categoryFilter === "all" || s.category === categoryFilter)
  );

  const totalSales = sales.length;
  const confirmedSales = sales.filter(s => s.status === "confirmed");
  const topProduct = confirmedSales.length > 0
    ? confirmedSales.reduce((top, s) => (s.commission > (top?.commission || 0) ? s : top), confirmedSales[0])
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Sales Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor all your attributed sales</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-xl sm:text-2xl font-bold font-display">{totalSales}</p>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
            <p className="text-xl sm:text-2xl font-bold font-display">{confirmedSales.length}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 mx-auto text-warning mb-1" />
            <p className="text-sm font-bold font-display truncate">{topProduct?.product_name || "—"}</p>
            <p className="text-xs text-muted-foreground">Top Product</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "confirmed", "pending", "cancelled"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "volt-gradient" : ""}>
            {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
        <div className="hidden sm:block border-l border-border mx-1" />
        {["all", "physical", "digital", "fintech", "events"].map((c) => (
          <Button key={c} variant={categoryFilter === c ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(c)}
            className={categoryFilter === c ? "volt-gradient" : ""}>
            {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[600px]">
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
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sales yet</TableCell>
                </TableRow>
              )}
              {filtered.map((sale) => (
                <TableRow key={sale.id} className="border-border/50">
                  <TableCell className="text-xs">{sale.date}</TableCell>
                  <TableCell className="font-medium text-sm">{sale.product_name}</TableCell>
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
