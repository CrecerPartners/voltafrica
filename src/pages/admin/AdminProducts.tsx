import { useState } from "react";
import { useAdminProducts, useUpsertProduct, useDeleteProduct } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const empty = { name: "", brand: "", category: "", price: 0, commission_rate: 0, image: "", description: "" };

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts();
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(empty);

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (p: any) => { setForm({ ...p }); setOpen(true); };

  const save = () => {
    upsert.mutate(form, {
      onSuccess: () => { toast({ title: "Product saved" }); setOpen(false); },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Product deleted" }),
    });
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>₦{Number(p.price).toLocaleString()}</TableCell>
                  <TableCell>{p.commission_rate}%</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{form.id ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Input placeholder="Brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            <Input placeholder="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Price" value={form.price} onChange={(e) => set("price", +e.target.value)} />
              <Input type="number" placeholder="Commission %" value={form.commission_rate} onChange={(e) => set("commission_rate", +e.target.value)} />
            </div>
            <Input placeholder="Image URL" value={form.image} onChange={(e) => set("image", e.target.value)} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
