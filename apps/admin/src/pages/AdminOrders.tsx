import { useState } from "react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { Input } from "@digihire/shared";
import { Button } from "@digihire/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@digihire/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@digihire/shared";
import { Badge } from "@digihire/shared";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@digihire/shared";
import { toast } from "@digihire/shared";
import { ChevronDown } from "lucide-react";
import { AdminTablePagination, paginateItems } from "@/components/AdminTablePagination";

const PAGE_SIZE = 20;
const ORDER_STATUSES = ["pending", "confirmed", "delivered"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = orders?.filter((o: any) => {
    const matchSearch =
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast({ title: `Order status updated to ${status}` }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <span className="text-sm text-muted-foreground">{orders?.length ?? 0} total</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="Search by name, email, or ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-36">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((o: any) => (
                <Collapsible key={o.id} asChild open={expanded.has(o.id)} onOpenChange={() => toggleExpand(o.id)}>
                  <>
                    <TableRow>
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded.has(o.id) ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{o.name}</TableCell>
                      <TableCell className="text-sm">{o.email}</TableCell>
                      <TableCell className="text-sm font-medium">₦{Number(o.total).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[o.status] || ""}>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={7}>
                          <div className="py-2 px-4 space-y-1">
                            <p className="text-xs font-medium mb-2">Order Items</p>
                            <div className="space-y-1.5">
                              {o.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-xs">
                                  <span>{item.products?.name ?? "Unknown"} × {item.quantity}</span>
                                  <div className="flex gap-4">
                                    <span>₦{Number(item.price).toLocaleString()}</span>
                                    {item.ref_code && <span className="text-muted-foreground">Ref: {item.ref_code}</span>}
                                  </div>
                                </div>
                              ))}
                              {(!o.order_items || o.order_items.length === 0) && (
                                <p className="text-xs text-muted-foreground">No items</p>
                              )}
                            </div>
                            <div className="border-t mt-2 pt-2 text-xs text-muted-foreground">
                              <span>📍 {o.address}, {o.city}, {o.state}</span>
                              {o.phone && <span className="ml-4">📞 {o.phone}</span>}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
              {paginated.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No orders found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered?.length ?? 0} pageSize={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
}


