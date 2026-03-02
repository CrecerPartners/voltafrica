import { useState } from "react";
import { useAdminUsers, useUpdateUserTier } from "@/hooks/useAdminData";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const tiers = ["Bronze", "Silver", "Gold", "Platinum"];

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const updateTier = useUpdateUserTier();
  const [search, setSearch] = useState("");

  const filtered = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.university.toLowerCase().includes(search.toLowerCase())
  );

  const handleTierChange = (userId: string, tier: string) => {
    updateTier.mutate({ userId, tier }, {
      onSuccess: () => toast({ title: "Tier updated" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <span className="text-sm text-muted-foreground">{users?.length ?? 0} total</span>
      </div>
      <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.university}</TableCell>
                  <TableCell>
                    <Select value={u.tier} onValueChange={(v) => handleTierChange(u.user_id, v)}>
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiers.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
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
