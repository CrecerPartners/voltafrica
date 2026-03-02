import { useState, useRef } from "react";
import { useAdminProducts, useUpsertProduct, useDeleteProduct } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminTablePagination, paginateItems } from "@/components/admin/AdminTablePagination";

const empty = { name: "", brand: "", category: "", price: 0, commission_rate: 0, image: "", description: "", assets: { images: [] as string[], videos: [] as string[] } };
const PAGE_SIZE = 20;

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts();
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = products?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const openNew = () => { setForm({ ...empty, assets: { images: [], videos: [] } }); setVideoUrl(""); setOpen(true); };
  const openEdit = (p: any) => {
    const assets = typeof p.assets === "object" && p.assets ? p.assets : { images: [], videos: [] };
    setForm({ ...p, assets: { images: assets.images || [], videos: assets.videos || [] } });
    setVideoUrl("");
    setOpen(true);
  };

  const save = () => {
    const toSave = { ...form };
    // Set first image as main image if not set
    if (!toSave.image && toSave.assets?.images?.length > 0) {
      toSave.image = toSave.assets.images[0];
    }
    upsert.mutate(toSave, {
      onSuccess: () => { toast({ title: "Product saved" }); setOpen(false); },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    remove.mutate(id, { onSuccess: () => toast({ title: "Product deleted" }) });
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const url = urlData.publicUrl;
    setForm((f) => ({
      ...f,
      assets: { ...f.assets, images: [...(f.assets?.images || []), url] },
      image: f.image || url,
    }));
    setUploading(false);
    toast({ title: "Image uploaded" });
  };

  const removeImage = (idx: number) => {
    setForm((f) => {
      const images = [...(f.assets?.images || [])];
      const removed = images.splice(idx, 1)[0];
      return {
        ...f,
        assets: { ...f.assets, images },
        image: f.image === removed ? (images[0] || "") : f.image,
      };
    });
  };

  const addVideo = () => {
    if (!videoUrl.trim()) return;
    setForm((f) => ({
      ...f,
      assets: { ...f.assets, videos: [...(f.assets?.videos || []), videoUrl.trim()] },
    }));
    setVideoUrl("");
  };

  const removeVideo = (idx: number) => {
    setForm((f) => {
      const videos = [...(f.assets?.videos || [])];
      videos.splice(idx, 1);
      return { ...f, assets: { ...f.assets, videos } };
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                  </TableCell>
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
          <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered?.length ?? 0} pageSize={PAGE_SIZE} />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            <Input placeholder="Brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            <Input placeholder="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Price" value={form.price} onChange={(e) => set("price", +e.target.value)} />
              <Input type="number" placeholder="Commission %" value={form.commission_rate} onChange={(e) => set("commission_rate", +e.target.value)} />
            </div>
            <Textarea placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />

            {/* Image management */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Product Images</p>
              <div className="flex flex-wrap gap-2">
                {(form.assets?.images || []).map((url: string, i: number) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="h-20 w-20 rounded object-cover border" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>

            {/* Video management */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Product Videos</p>
              {(form.assets?.videos || []).map((url: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate text-muted-foreground">{url}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeVideo(i)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Video URL (YouTube, etc.)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={addVideo}>Add</Button>
              </div>
            </div>
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
