import { useState } from "react";
import { useAdminUsers, useUpdateUserTier, useUpdateProfile, useDeleteProfile } from "@/hooks/useAdminData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, Trash2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { exportToCsv } from "@/lib/csvExport";
import { AdminTablePagination, paginateItems } from "@/components/admin/AdminTablePagination";

const tiers = ["Bronze", "Silver", "Gold", "Platinum"];
const PAGE_SIZE = 20;

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const updateTier = useUpdateUserTier();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = users?.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.university.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const handleTierChange = (userId: string, tier: string) => {
    updateTier.mutate({ userId, tier }, {
      onSuccess: () => toast({ title: "Tier updated" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const openDetail = (u: any) => {
    setSelected(u);
    setEditForm({ name: u.name, university: u.university, whatsapp: u.whatsapp || "", bank_name: u.bank_name || "", account_number: u.account_number || "" });
  };

  const saveEdit = () => {
    if (!selected) return;
    updateProfile.mutate({ userId: selected.user_id, updates: editForm }, {
      onSuccess: () => { toast({ title: "Profile updated" }); setSelected(null); },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteProfile.mutate(deleteId, {
      onSuccess: () => { toast({ title: "User deleted" }); setDeleteId(null); setSelected(null); },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleExport = () => {
    if (!filtered?.length) return;
    exportToCsv("users", filtered, [
      { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "university", label: "University" },
      { key: "tier", label: "Tier" }, { key: "whatsapp", label: "WhatsApp" }, { key: "bank_name", label: "Bank" },
      { key: "account_number", label: "Account" }, { key: "created_at", label: "Joined" },
    ]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{users?.length ?? 0} total</span>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!filtered?.length}>Export CSV</Button>
        </div>
      </div>
      <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="mb-4 max-w-sm" />
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{u.name?.charAt(0) || "?"}</div>
                      )}
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.university}</TableCell>
                  <TableCell>
                    <Select value={u.tier} onValueChange={(v) => handleTierChange(u.user_id, v)}>
                      <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(u)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(u.user_id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered?.length ?? 0} pageSize={PAGE_SIZE} />
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>User Details</SheetTitle></SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                {selected.avatar_url ? (
                  <img src={selected.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">{selected.name?.charAt(0) || "?"}</div>
                )}
                <div><p className="font-semibold text-lg">{selected.name}</p><p className="text-sm text-muted-foreground">{selected.email}</p></div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Tier</span><span className="font-medium">{selected.tier}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Referral Code</span><span className="font-mono">{selected.referral_code || "—"}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Joined</span><span>{new Date(selected.created_at).toLocaleDateString()}</span></div>
              </div>
              <div className="pt-2 space-y-3">
                <p className="text-sm font-medium">Edit Profile</p>
                <div className="grid gap-2">
                  <Input placeholder="Name" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="University" value={editForm.university} onChange={(e) => setEditForm(f => ({ ...f, university: e.target.value }))} />
                  <Input placeholder="WhatsApp" value={editForm.whatsapp} onChange={(e) => setEditForm(f => ({ ...f, whatsapp: e.target.value }))} />
                  <Input placeholder="Bank Name" value={editForm.bank_name} onChange={(e) => setEditForm(f => ({ ...f, bank_name: e.target.value }))} />
                  <Input placeholder="Account Number" value={editForm.account_number} onChange={(e) => setEditForm(f => ({ ...f, account_number: e.target.value }))} />
                </div>
                <Button onClick={saveEdit} disabled={updateProfile.isPending} className="w-full"><Save className="h-4 w-4 mr-1" /> Save Changes</Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Link to={`/admin/sales?user=${selected.user_id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">View Sales</Button>
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this user's profile? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteProfile.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
