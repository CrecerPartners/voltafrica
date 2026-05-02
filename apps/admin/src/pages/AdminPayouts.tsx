import { useState } from "react";
import { useAdminPayouts, useUpdatePayoutStatus, useAdminTransactions, useUpdateTransactionStatus } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@digihire/shared";
import { Button } from "@digihire/shared";
import { Input } from "@digihire/shared";
import { Textarea } from "@digihire/shared";
import { Badge } from "@digihire/shared";
import { Checkbox } from "@digihire/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@digihire/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@digihire/shared";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye, Search } from "lucide-react";
import { exportToCsv } from "@digihire/shared";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { AdminTablePagination, paginateItems } from "@/components/admin/AdminTablePagination";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const PAGE_SIZE = 20;

export default function AdminPayouts() {
  const { data: payouts, isLoading } = useAdminPayouts();
  const { data: transactions } = useAdminTransactions();
  const updatePayout = useUpdatePayoutStatus();
  const updateTx = useUpdateTransactionStatus();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionPayout, setActionPayout] = useState<any>(null);
  const [actionType, setActionType] = useState<"process" | "reject">("process");
  const [actionNotes, setActionNotes] = useState("");
  const [detailPayout, setDetailPayout] = useState<any>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  let filtered = filter === "all" ? payouts : payouts?.filter((p) => p.status === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered?.filter((p: any) => p.profile?.name?.toLowerCase().includes(q) || p.bank_name.toLowerCase().includes(q) || p.account_number.includes(q));
  }
  if (dateFrom) filtered = filtered?.filter((p) => new Date(p.requested_at) >= dateFrom);
  if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59); filtered = filtered?.filter((p) => new Date(p.requested_at) <= end); }

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const openAction = (payout: any, type: "process" | "reject") => { setActionPayout(payout); setActionType(type); setActionNotes(payout.notes || ""); };

  const processPayoutWithTx = async (payout: any, status: string, notes?: string) => {
    await updatePayout.mutateAsync({ payoutId: payout.id, status, notes });
    const tx = transactions?.find((t) =>
      t.user_id === payout.user_id && t.type === "payout" &&
      (t.status === "processing" || t.status === "pending") &&
      Math.abs(Math.abs(Number(t.amount)) - Number(payout.amount)) < 0.01
    );
    if (tx) {
      await updateTx.mutateAsync({ transactionId: tx.id, status: status === "processed" ? "paid" : "cancelled" });
    }
  };

  const confirmAction = async () => {
    if (!actionPayout) return;
    const status = actionType === "process" ? "processed" : "rejected";
    try {
      await processPayoutWithTx(actionPayout, status, actionNotes || undefined);
      toast({ title: `Payout ${status}` });
      setActionPayout(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleBulkProcess = async () => {
    setBulkProcessing(true);
    const pending = (filtered || []).filter(p => selected.has(p.id) && p.status === "pending");
    for (const p of pending) {
      try { await processPayoutWithTx(p, "processed"); } catch {}
    }
    setSelected(new Set());
    setBulkProcessing(false);
    toast({ title: `${pending.length} payout(s) processed` });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    const pendingIds = paginated.filter(p => p.status === "pending").map(p => p.id);
    const allSelected = pendingIds.every(id => selected.has(id));
    setSelected(prev => { const n = new Set(prev); pendingIds.forEach(id => allSelected ? n.delete(id) : n.add(id)); return n; });
  };

  const handleExport = () => {
    if (!filtered?.length) return;
    exportToCsv("payouts", filtered.map((p: any) => ({ ...p, user: p.profile?.name ?? "" })), [
      { key: "requested_at", label: "Requested" }, { key: "user", label: "User" }, { key: "amount", label: "Amount" },
      { key: "bank_name", label: "Bank" }, { key: "account_number", label: "Account" }, { key: "status", label: "Status" }, { key: "notes", label: "Notes" },
    ]);
  };

  const pendingCount = payouts?.filter(p => p.status === "pending").length || 0;
  const selectedPendingCount = [...selected].filter(id => (filtered || []).find((p: any) => p.id === id && p.status === "pending")).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Payout Processing</h2>
          {pendingCount > 0 && <Badge className="bg-yellow-500 text-white">{pendingCount} pending</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!filtered?.length}>Export CSV</Button>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, bank..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1); }} />
      </div>

      {selectedPendingCount > 0 && (
        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-muted">
          <span className="text-sm">{selectedPendingCount} pending payout(s) selected</span>
          <Button size="sm" onClick={handleBulkProcess} disabled={bulkProcessing}>
            <Check className="h-3.5 w-3.5 mr-1" /> Bulk Process
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={paginated.filter(p => p.status === "pending").length > 0 && paginated.filter(p => p.status === "pending").every(p => selected.has(p.id))} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.status === "pending" && <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />}</TableCell>
                  <TableCell className="text-xs">{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm font-medium">{p.profile?.name || "Unknown"}</TableCell>
                  <TableCell className="font-medium">â‚¦{Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell>{p.bank_name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.account_number}</TableCell>
                  <TableCell><Badge variant="secondary" className={statusColors[p.status] || ""}>{p.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{p.notes || "â€”"}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" onClick={() => setDetailPayout(p)}><Eye className="h-3.5 w-3.5" /></Button>
                      {p.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openAction(p, "process")}><Check className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openAction(p, "reject")}><X className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered?.length ?? 0} pageSize={PAGE_SIZE} />
        </div>
      )}

      <Dialog open={!!actionPayout} onOpenChange={(o) => !o && setActionPayout(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{actionType === "process" ? "Process Payout" : "Reject Payout"}</DialogTitle></DialogHeader>
          {actionPayout && (
            <div className="space-y-3">
              <p className="text-sm">{actionType === "process" ? "Confirm processing" : "Reject"} payout of <strong>â‚¦{Number(actionPayout.amount).toLocaleString()}</strong> to <strong>{actionPayout.profile?.name || "user"}</strong>?</p>
              <div><label className="text-xs text-muted-foreground">Notes (optional)</label><Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} placeholder="Add notes..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionPayout(null)}>Cancel</Button>
            <Button variant={actionType === "reject" ? "destructive" : "default"} onClick={confirmAction} disabled={updatePayout.isPending}>{actionType === "process" ? "Process" : "Reject"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailPayout} onOpenChange={(o) => !o && setDetailPayout(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payout Details</DialogTitle></DialogHeader>
          {detailPayout && (
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Requester</span><span className="font-medium">{detailPayout.profile?.name || "Unknown"}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Email</span><span>{detailPayout.profile?.email || "â€”"}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Amount</span><span className="font-medium">â‚¦{Number(detailPayout.amount).toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Bank</span><span>{detailPayout.bank_name}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Account</span><span className="font-mono">{detailPayout.account_number}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Status</span><Badge variant="secondary" className={statusColors[detailPayout.status] || ""}>{detailPayout.status}</Badge></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Requested</span><span>{new Date(detailPayout.requested_at).toLocaleString()}</span></div>
              {detailPayout.processed_at && <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Processed</span><span>{new Date(detailPayout.processed_at).toLocaleString()}</span></div>}
              {detailPayout.notes && <div className="pt-1"><span className="text-muted-foreground">Notes:</span><p className="mt-1">{detailPayout.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

