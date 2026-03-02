import { useState } from "react";
import { useAdminPayouts, useUpdatePayoutStatus } from "@/hooks/useAdminData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminPayouts() {
  const { data: payouts, isLoading } = useAdminPayouts();
  const updatePayout = useUpdatePayoutStatus();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? payouts : payouts?.filter((p) => p.status === filter);

  const handleProcess = (id: string) => {
    updatePayout.mutate({ payoutId: id, status: "processed" }, {
      onSuccess: () => toast({ title: "Payout marked as processed" }),
    });
  };

  const handleReject = (id: string) => {
    updatePayout.mutate({ payoutId: id, status: "rejected", notes: "Rejected by admin" }, {
      onSuccess: () => toast({ title: "Payout rejected" }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Payout Processing</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
                <TableHead>Requested</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">₦{Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell>{p.bank_name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.account_number}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[p.status] || ""}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{p.notes || "—"}</TableCell>
                  <TableCell>
                    {p.status === "pending" && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleProcess(p.id)} title="Process">
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleReject(p.id)} title="Reject">
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
