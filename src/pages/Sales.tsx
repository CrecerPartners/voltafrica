import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSales } from "@/hooks/useSales";
import { formatNaira } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, TrendingUp, Star, Loader2, PlusCircle, AlertCircle } from "lucide-react";
import { ManualSaleDialog } from "@/components/ManualSaleDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const statusColors: Record<string, string> = {
  confirmed: "text-success border-success/20",
  pending: "text-warning border-warning/20",
  cancelled: "text-destructive border-destructive/20",
};

const conversionColors: Record<string, string> = {
  clicked: "bg-muted text-muted-foreground",
  signed_up: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  verified: "bg-success/10 text-success border-success/20",
  paid_out: "bg-primary/10 text-primary border-primary/20",
};

const Sales = () => {
  const { data: sales = [], isLoading } = useSales();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [manualSaleOpen, setManualSaleOpen] = useState(false);

  const filtered = sales.filter(
    (s) =>
      (statusFilter === "all" || s.status === statusFilter) &&
      (typeFilter === "all" ||
        (typeFilter === "leads" && s.product_type === "lead") ||
        (typeFilter === "sales" && s.product_type !== "lead"))
  );

  const totalSales = sales.length;
  const confirmedSales = sales.filter(s => s.status === "confirmed");
  const leadCount = sales.filter(s => s.product_type === "lead").length;
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Sales Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor all your attributed sales & leads</p>
        </div>
        <Button className="volt-gradient" onClick={() => setManualSaleOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Log a Sale
        </Button>
      </div>

      {sales.filter(s => s.status === "pending").length > 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            You have {sales.filter(s => s.status === "pending").length} sale(s) pending verification. Commissions will be credited once confirmed by admin.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xl sm:text-2xl font-bold font-display">{leadCount}</p>
            <p className="text-xs text-muted-foreground">Leads</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Type filter */}
        {["all", "sales", "leads"].map((t) => (
          <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)}
            className={typeFilter === t ? "volt-gradient" : ""}>
            {t === "all" ? "All" : t === "sales" ? "Sales" : "Leads"}
          </Button>
        ))}
        <div className="hidden sm:block border-l border-border mx-1" />
        {/* Status filter */}
        {["all", "confirmed", "pending", "cancelled"].map((s) => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "volt-gradient" : ""}>
            {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sales yet</TableCell>
                </TableRow>
              )}
              {filtered.map((sale) => (
                <TableRow key={sale.id} className="border-border/50">
                  <TableCell className="text-xs">{sale.date}</TableCell>
                  <TableCell className="font-medium text-sm">{sale.product_name}</TableCell>
                  <TableCell>
                    {sale.product_type === "lead" ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Lead</Badge>
                        {sale.conversion_status && (
                          <Badge variant="outline" className={`${conversionColors[sale.conversion_status] || ""} text-[10px] block w-fit`}>
                            {sale.conversion_status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {sale.product_type === "digital" ? "Digital" : "Physical"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{sale.customer}</TableCell>
                  <TableCell className="text-right text-sm">{sale.amount > 0 ? formatNaira(sale.amount) : "—"}</TableCell>
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
      <ManualSaleDialog open={manualSaleOpen} onOpenChange={setManualSaleOpen} />
    </div>
  );
};

export default Sales;
