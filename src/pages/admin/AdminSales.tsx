import { useState } from "react";
import { useAdminSales, useUpdateSaleStatus, useUpdateSaleDetails, useUpdateTransactionStatus, useAdminTransactions, useAdminUsers } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Download, Eye, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminSales() {
  const { data: sales, isLoading } = useAdminSales();
  const { data: transactions } = useAdminTransactions();
  const { data: users } = useAdminUsers();
  const updateSale = useUpdateSaleStatus();
  const updateDetails = useUpdateSaleDetails();
  const updateTx = useUpdateTransactionStatus();
  const [searchParams] = useSearchParams();
  const userFilter = searchParams.get("user");

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailSale, setDetailSale] = useState<any>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editCommission, setEditCommission] = useState(0);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  // Build user map for name lookup
  const userMap = Object.fromEntries((users || []).map((u) => [u.user_id, u]));

  const getSellerName = (sale: any) => {
    // Try joined profile first
    if (sale.profiles?.name) return sale.profiles.name;
    return userMap[sale.user_id]?.name || "Unknown";
  };

  let filtered = filter === "all" ? sales : sales?.filter((s) => s.status === filter);
  if (userFilter) filtered = filtered?.filter((s) => s.user_id === userFilter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered?.filter((s: any) =>
      s.customer?.toLowerCase().includes(q) ||
      s.products?.name?.toLowerCase().includes(q) ||
      getSellerName(s).toLowerCase().includes(q)
    );
  }

  const findMatchingTransaction = (sale: any) => {
    return transactions?.find((t) =>
      t.user_id === sale.user_id &&
      (t.type === "commission" || t.type === "manual_sale") &&
      t.status === "pending" &&
      Math.abs(Number(t.amount) - Number(sale.commission)) < 0.01
    );
  };

  const handleConfirm = async (sale: any) => {
    await updateSale.mutateAsync({ saleId: sale.id, status: "confirmed" });
    const tx = findMatchingTransaction(sale);
    if (tx) await updateTx.mutateAsync({ transactionId: tx.id, status: "paid" });
    toast({ title: "Sale confirmed & commission credited to wallet" });
  };

  const handleCancel = async (sale: any) => {
    await updateSale.mutateAsync({ saleId: sale.id, status: "cancelled" });
    const tx = findMatchingTransaction(sale);
    if (tx) await updateTx.mutateAsync({ transactionId: tx.id, status: "cancelled" as any });
    toast({ title: "Sale cancelled" });
  };

  const openDetail = (s: any) => {
    setDetailSale(s);
    setEditNotes(s.notes || "");
    setEditAmount(Number(s.amount));
    setEditCommission(Number(s.commission));
  };

  const saveDetails = () => {
    if (!detailSale) return;
    updateDetails.mutate({ saleId: detailSale.id, updates: { notes: editNotes, amount: editAmount, commission: editCommission } }, {
      onSuccess: () => { toast({ title: "Sale updated" }); setDetailSale(null); },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const viewProof = async (url: string) => {
    const { data, error } = await supabase.storage.from("sale-proofs").createSignedUrl(url, 300);
    if (error || !data) { toast({ title: "Error loading proof", variant: "destructive" }); return; }
    setProofUrl(data.signedUrl);
  };

  const downloadProof = async (url: string) => {
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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Sales Verification</h2>
          {(() => { const pending = sales?.filter(s => s.status === "pending").length || 0; return pending > 0 ? <Badge className="bg-yellow-500 text-white">{pending} pending</Badge> : null; })()}
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by seller, customer, product..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs">{new Date(s.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{getSellerName(s)}</TableCell>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>{s.products?.name ?? "—"}</TableCell>
                  <TableCell>₦{Number(s.amount).toLocaleString()}</TableCell>
                  <TableCell>₦{Number(s.commission).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[s.status] || ""}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.proof_file_url ? (
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" onClick={() => viewProof(s.proof_file_url)} title="Preview">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadProof(s.proof_file_url)} title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(s)} title="Details"><Eye className="h-4 w-4" /></Button>
                      {s.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleConfirm(s)} title="Confirm">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancel(s)} title="Reject">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sale detail dialog */}
      <Dialog open={!!detailSale} onOpenChange={(o) => !o && setDetailSale(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sale Details</DialogTitle></DialogHeader>
          {detailSale && (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Seller:</span> <strong>{getSellerName(detailSale)}</strong></div>
                <div><span className="text-muted-foreground">Customer:</span> <strong>{detailSale.customer}</strong></div>
                <div><span className="text-muted-foreground">Product:</span> <strong>{detailSale.products?.name ?? "—"}</strong></div>
                <div><span className="text-muted-foreground">Quantity:</span> <strong>{detailSale.quantity}</strong></div>
                <div><span className="text-muted-foreground">Date:</span> <strong>{new Date(detailSale.date).toLocaleDateString()}</strong></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className={statusColors[detailSale.status] || ""}>{detailSale.status}</Badge></div>
              </div>
              {detailSale.status === "pending" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Amount</label>
                    <Input type="number" value={editAmount} onChange={(e) => setEditAmount(+e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Commission</label>
                    <Input type="number" value={editCommission} onChange={(e) => setEditCommission(+e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Admin Notes</label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailSale(null)}>Close</Button>
            <Button onClick={saveDetails} disabled={updateDetails.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof preview lightbox */}
      <Dialog open={!!proofUrl} onOpenChange={(o) => !o && setProofUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Proof of Sale</DialogTitle></DialogHeader>
          {proofUrl && <img src={proofUrl} alt="Proof" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
