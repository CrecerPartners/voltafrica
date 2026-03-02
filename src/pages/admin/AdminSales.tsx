import { useState } from "react";
import { useAdminSales, useUpdateSaleStatus, useUpdateTransactionStatus, useAdminTransactions } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Download } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminSales() {
  const { data: sales, isLoading } = useAdminSales();
  const { data: transactions } = useAdminTransactions();
  const updateSale = useUpdateSaleStatus();
  const updateTx = useUpdateTransactionStatus();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? sales : sales?.filter((s) => s.status === filter);

  const handleConfirm = async (sale: any) => {
    await updateSale.mutateAsync({ saleId: sale.id, status: "confirmed" });
    // find matching commission transaction for this user around same date
    const tx = transactions?.find(
      (t) => t.user_id === sale.user_id && t.type === "commission" && t.status === "pending"
    );
    if (tx) await updateTx.mutateAsync({ transactionId: tx.id, status: "paid" });
    toast({ title: "Sale confirmed" });
  };

  const handleCancel = async (sale: any) => {
    await updateSale.mutateAsync({ saleId: sale.id, status: "cancelled" });
    const tx = transactions?.find(
      (t) => t.user_id === sale.user_id && t.type === "commission" && t.status === "pending"
    );
    if (tx) await updateTx.mutateAsync({ transactionId: tx.id, status: "cancelled" as any });
    toast({ title: "Sale cancelled" });
  };

  const downloadProof = async (url: string) => {
    // url is the path in sale-proofs bucket
    const { data, error } = await supabase.storage.from("sale-proofs").download(url);
    if (error) { toast({ title: "Error downloading", variant: "destructive" }); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = url.split("/").pop() || "proof";
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sales Verification</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs">{new Date(s.date).toLocaleDateString()}</TableCell>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>{s.products?.name ?? "—"}</TableCell>
                  <TableCell>₦{Number(s.amount).toLocaleString()}</TableCell>
                  <TableCell>₦{Number(s.commission).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[s.status] || ""}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.proof_file_url ? (
                      <Button variant="ghost" size="icon" onClick={() => downloadProof(s.proof_file_url)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {s.status === "pending" && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleConfirm(s)} title="Confirm">
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleCancel(s)} title="Reject">
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
