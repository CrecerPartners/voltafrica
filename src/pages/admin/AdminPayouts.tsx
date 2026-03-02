import { useState } from "react";
import { useAdminPayouts, useUpdatePayoutStatus } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Check, X, Eye, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminPayouts() {
  const { data: payouts, isLoading } = useAdminPayouts();
  const updatePayout = useUpdatePayoutStatus();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionPayout, setActionPayout] = useState<any>(null);
  const [actionType, setActionType] = useState<"process" | "reject">("process");
  const [actionNotes, setActionNotes] = useState("");
  const [detailPayout, setDetailPayout] = useState<any>(null);

  let filtered = filter === "all" ? payouts : payouts?.filter((p) => p.status === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered?.filter((p: any) =>
      p.profile?.name?.toLowerCase().includes(q) ||
      p.bank_name.toLowerCase().includes(q) ||
      p.account_number.includes(q)
    );
  }

  const openAction = (payout: any, type: "process" | "reject") => {
    setActionPayout(payout);
    setActionType(type);
    setActionNotes(payout.notes || "");
  };

  const confirmAction = () => {
    if (!actionPayout) return;
    const status = actionType === "process" ? "processed" : "rejected";
    updatePayout.mutate({ payoutId: actionPayout.id, status, notes: actionNotes || undefined }, {
      onSuccess: () => {
        toast({ title: `Payout ${status}` });
        setActionPayout(null);
      },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Payout Processing</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, bank..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
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
              {filtered?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm font-medium">{p.profile?.name || "Unknown"}</TableCell>
                  <TableCell className="font-medium">₦{Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell>{p.bank_name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.account_number}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[p.status] || ""}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{p.notes || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" onClick={() => setDetailPayout(p)} title="View details">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {p.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openAction(p, "process")} title="Process">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openAction(p, "reject")} title="Reject">
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

      {/* Action dialog with notes */}
      <Dialog open={!!actionPayout} onOpenChange={(o) => !o && setActionPayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "process" ? "Process Payout" : "Reject Payout"}</DialogTitle>
          </DialogHeader>
          {actionPayout && (
            <div className="space-y-3">
              <p className="text-sm">
                {actionType === "process" ? "Confirm processing" : "Reject"} payout of <strong>₦{Number(actionPayout.amount).toLocaleString()}</strong> to <strong>{actionPayout.profile?.name || "user"}</strong>?
              </p>
              <div>
                <label className="text-xs text-muted-foreground">Notes (optional)</label>
                <Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} placeholder="Add notes..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionPayout(null)}>Cancel</Button>
            <Button variant={actionType === "reject" ? "destructive" : "default"} onClick={confirmAction} disabled={updatePayout.isPending}>
              {actionType === "process" ? "Process" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detailPayout} onOpenChange={(o) => !o && setDetailPayout(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payout Details</DialogTitle></DialogHeader>
          {detailPayout && (
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Requester</span><span className="font-medium">{detailPayout.profile?.name || "Unknown"}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Email</span><span>{detailPayout.profile?.email || "—"}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Amount</span><span className="font-medium">₦{Number(detailPayout.amount).toLocaleString()}</span></div>
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
