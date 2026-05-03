import { useState } from "react";
import { useAdminReferrals, useUpdateReferral } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@digihire/shared";
import { Input } from "@digihire/shared";
import { Button } from "@digihire/shared";
import { Badge } from "@digihire/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@digihire/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@digihire/shared";
import { toast } from "@digihire/shared";
import { Search, Pencil, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@digihire/shared";
import { AdminTablePagination, paginateItems } from "@/components/AdminTablePagination";

const statusColors: Record<string, string> = {
  signed_up: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const PAGE_SIZE = 20;

export default function AdminReferrals() {
  const { data: referrals, isLoading } = useAdminReferrals();
  const updateReferral = useUpdateReferral();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editRef, setEditRef] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editEarnings, setEditEarnings] = useState(0);

  let filtered = filter === "all" ? referrals : referrals?.filter((r: any) => r.status === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered?.filter((r: any) => r.referrer_name?.toLowerCase().includes(q) || r.referred_name?.toLowerCase().includes(q));
  }

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const openEdit = (r: any) => { setEditRef(r); setEditStatus(r.status); setEditEarnings(Number(r.earnings)); };

  const saveEdit = () => {
    if (!editRef) return;
    updateReferral.mutate({ referralId: editRef.id, updates: { status: editStatus, earnings: editEarnings } }, {
      onSuccess: () => { toast({ title: "Referral updated" }); setEditRef(null); },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const quickStatusChange = (r: any, newStatus: string) => {
    updateReferral.mutate({ referralId: r.id, updates: { status: newStatus } }, {
      onSuccess: () => toast({ title: `Referral marked as ${newStatus}` }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const totalEarnings = referrals?.reduce((sum, r: any) => sum + Number(r.earnings), 0) ?? 0;
  const signedUpCount = referrals?.filter((r: any) => r.status === "signed_up").length ?? 0;
  const activeCount = referrals?.filter((r: any) => r.status === "active").length ?? 0;
  const inactiveCount = referrals?.filter((r: any) => r.status === "inactive").length ?? 0;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{referrals?.length ?? 0}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-500">{signedUpCount}</p><p className="text-xs text-muted-foreground">Signed Up</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-500">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p><p className="text-xs text-muted-foreground">Inactive</p></CardContent></Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Referrals</h2>
          <p className="text-sm text-muted-foreground">₦{totalEarnings.toLocaleString()} total earned</p>
        </div>
        <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="signed_up">Signed Up</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search referrals..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{r.referrer_name}</TableCell>
                  <TableCell>{r.referred_name}</TableCell>
                  <TableCell><Badge variant="secondary" className={statusColors[r.status] || ""}>{r.status}</Badge></TableCell>
                  <TableCell>₦{Number(r.earnings).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {r.status === "signed_up" && (
                        <Button variant="ghost" size="sm" className="text-xs text-green-600" onClick={() => quickStatusChange(r, "active")}>
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Active
                        </Button>
                      )}
                      {r.status === "active" && (
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => quickStatusChange(r, "inactive")}>
                          <UserX className="h-3.5 w-3.5 mr-1" /> Inactive
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered?.length ?? 0} pageSize={PAGE_SIZE} />
        </div>
      )}

      <Dialog open={!!editRef} onOpenChange={(o) => !o && setEditRef(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Referral</DialogTitle></DialogHeader>
          {editRef && (
            <div className="grid gap-3">
              <div className="text-sm"><span className="text-muted-foreground">Referrer:</span> <strong>{editRef.referrer_name}</strong></div>
              <div className="text-sm"><span className="text-muted-foreground">Referred:</span> <strong>{editRef.referred_name}</strong></div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed_up">Signed Up</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Earnings (₦)</label>
                <Input type="number" value={editEarnings} onChange={(e) => setEditEarnings(+e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRef(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={updateReferral.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


