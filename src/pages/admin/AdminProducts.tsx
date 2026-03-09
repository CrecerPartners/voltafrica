import { useState, useRef, useEffect } from "react";
import { useAdminProducts, useUpsertProduct, useDeleteProduct, useInsertLicenseKeys } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AdminTablePagination, paginateItems } from "@/components/admin/AdminTablePagination";
import { Label } from "@/components/ui/label";

const categoriesByType: Record<string, string[]> = {
  Physical: ["Fashion & Lifestyle", "Electronics & Gadgets"],
  Digital: ["Fintech", "Tech Products", "Software & Tools", "Subscriptions"],
};

const subcategoriesByCategory: Record<string, string[]> = {
  "Fashion & Lifestyle": ["Clothing", "Shoes", "Bags", "Accessories", "Jewelry", "Skincare", "Haircare"],
  "Electronics & Gadgets": ["Phones", "Laptops", "Tablets", "Accessories"],
  "Fintech": ["Fintech App Signup", "Fintech App Install / Download"],
  "Tech Products": ["Tech Product Signup", "Tech Product Install / Download"],
  "Software & Tools": ["Software / Tools Signup"],
  "Subscriptions": ["Subscriptions"],
};

const empty = {
  name: "", brand: "", category: "", subcategory: "", price: 0, commission_rate: 0, image: "", description: "",
  product_type: "Physical", commission_model: "percentage", delivery_type: "manual_provision", delivery_instructions: "",
  assets: { images: [] as string[], videos: [] as string[], fulfillment_url: "" },
};

const PAGE_SIZE = 20;

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts();
  const upsert = useUpsertProduct();
  const insertKeys = useInsertLicenseKeys();
  const remove = useDeleteProduct();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(empty);
  const [newLicenseKeys, setNewLicenseKeys] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = products?.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const openNew = () => { 
    setForm({ ...empty, assets: { images: [], videos: [], fulfillment_url: "" } }); 
    setNewLicenseKeys("");
    setVideoUrl(""); 
    setOpen(true); 
  };
  
  const openEdit = (p: any) => {
    const assets = typeof p.assets === "object" && p.assets ? p.assets : { images: [], videos: [] };
    setForm({
      ...p,
      product_type: p.product_type || "Physical",
      category: p.category || "",
      subcategory: p.subcategory || "",
      commission_model: p.commission_model || "percentage",
      delivery_type: p.delivery_type || "manual_provision",
      delivery_instructions: p.delivery_instructions || "",
      assets: { images: assets.images || [], videos: assets.videos || [], fulfillment_url: assets.fulfillment_url || "" },
    });
    setNewLicenseKeys("");
    setVideoUrl("");
    setOpen(true);
  };

  const save = () => {
    const toSave = { ...form };
    if (!toSave.image && toSave.assets?.images?.length > 0) {
      toSave.image = toSave.assets.images[0];
    }
    upsert.mutate(toSave, {
      onSuccess: (data: any) => { 
        // If there are new license keys to insert
        if (toSave.delivery_type === "license_key" && newLicenseKeys.trim()) {
          // data is not returned from upsert directly because of no select() by default,
          // but if we are editing (toSave.id exists) we can insert keys.
          // If it's a new product, we would need the created ID, so we must rely on editing for keys.
          if (toSave.id) {
            const keys = newLicenseKeys.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
            if (keys.length > 0) {
               insertKeys.mutate({ productId: toSave.id, keys });
            }
          }
        }
        toast({ title: "Product saved" }); 
        setOpen(false); 
      },
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

  const showFulfillmentUrl = form.product_type === "Digital";

  const availableCategories = categoriesByType[form.product_type] || [];
  const availableSubcategories = subcategoriesByCategory[form.category] || [];

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
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
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
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {p.product_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.category}
                    {p.subcategory && <span className="text-muted-foreground block text-[10px]">{p.subcategory}</span>}
                  </TableCell>
                  <TableCell>₦{Number(p.price).toLocaleString()}</TableCell>
                  <TableCell>{p.commission_rate}% <span className="text-xs text-muted-foreground">({p.commission_model || "percentage"})</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Product Name</label>
                <Input placeholder="iPhone 15 Pro" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Brand / Provider</label>
                <Input placeholder="Apple" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Product Type</label>
                <Select value={form.product_type} onValueChange={(v) => {
                  setForm(f => ({ ...f, product_type: v, category: "", subcategory: "" }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category</label>
                <Select value={form.category} onValueChange={(v) => {
                  setForm(f => ({ ...f, category: v, subcategory: "" }));
                }} disabled={!form.product_type}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subcategory</label>
                <Select value={form.subcategory} onValueChange={(v) => set("subcategory", v)} disabled={!form.category}>
                  <SelectTrigger><SelectValue placeholder="Subcategory" /></SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Commission Model</label>
                <Select value={form.commission_model} onValueChange={(v) => set("commission_model", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                    <SelectItem value="per_signup">Per Sign-Up (₦)</SelectItem>
                    <SelectItem value="per_install">Per Install (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price (₦)</label>
                <Input type="number" placeholder="0" value={form.price} onChange={(e) => set("price", +e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Commission Rate / Amount</label>
              <Input type="number" placeholder="Value" value={form.commission_rate} onChange={(e) => set("commission_rate", +e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe the product..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
            </div>

            {/* Delivery Configuration */}
            {form.product_type === "Digital" && (
              <div className="space-y-3 p-4 bg-muted/20 border rounded-lg">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Delivery Configuration
                </h3>
                <div className="space-y-1.5">
                  <Label>Delivery Method</Label>
                  <Select value={form.delivery_type} onValueChange={(v) => set("delivery_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_url">Immediate Redirect (Lead/Signup/Install)</SelectItem>
                      <SelectItem value="direct_link">Paid Direct Download/Access Link</SelectItem>
                      <SelectItem value="license_key">Software License Keys</SelectItem>
                      <SelectItem value="manual_provision">Manual Provisioning (Account Setup)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.delivery_type === "lead_url" && (
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs text-muted-foreground uppercase">Fulfillment / Redirect URL</Label>
                    <Input
                      placeholder="https://partner-site.com/signup"
                      value={form.assets?.fulfillment_url || ""}
                      onChange={(e) => setForm((f) => ({ ...f, assets: { ...f.assets, fulfillment_url: e.target.value } }))}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Buyers click "Sign Up Now" and go directly here (with ?ref= tracking appended). They skip the cart.
                    </p>
                  </div>
                )}

                {form.delivery_type === "direct_link" && (
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs text-muted-foreground uppercase">Private Access / Download URL</Label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={form.assets?.fulfillment_url || ""}
                      onChange={(e) => setForm((f) => ({ ...f, assets: { ...f.assets, fulfillment_url: e.target.value } }))}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Revealed to the buyer immediately only AFTER successful Paystack checkout.
                    </p>
                  </div>
                )}

                {form.delivery_type === "license_key" && (
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs justify-between flex text-muted-foreground uppercase">
                      <span>Add New License Keys</span>
                      {form.id ? <span className="text-primary">* Will be tracked automatically</span> : <span className="text-warning">* Save product first to add keys</span>}
                    </Label>
                    <Textarea 
                      placeholder={form.id ? "Paste keys separated by commas or new lines..." : "Please save the product first before uploading keys."}
                      value={newLicenseKeys} 
                      onChange={(e) => setNewLicenseKeys(e.target.value)} 
                      rows={3} 
                      disabled={!form.id}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Volt will automatically assign one unused key per purchase and reveal it post-payment.
                    </p>
                  </div>
                )}

                {form.delivery_type === "manual_provision" && (
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs text-muted-foreground uppercase">Instructions for Buyer Post-Purchase</Label>
                    <Textarea 
                      placeholder="Thank you for purchasing! We will email your login credentials within 2-4 hours..." 
                      value={form.delivery_instructions || ""} 
                      onChange={(e) => set("delivery_instructions", e.target.value)} 
                      rows={2} 
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      The buyer sees this on their receipt while they wait for you to set up their account.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Image management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Product Images</p>
                <Button type="button" variant="outline" size="xs" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="h-3 w-3 mr-1" /> {uploading ? "Uploading..." : "Add Image"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 p-2 border rounded-md min-h-[100px] bg-muted/10">
                {(form.assets?.images || []).map((url: string, i: number) => (
                  <div key={i} className="relative group shrink-0">
                    <img src={url} alt="" className="h-20 w-20 rounded-md object-cover border shadow-sm group-hover:opacity-75 transition-opacity" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                    {form.image === url && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5 rounded-b-md">Main</div>
                    )}
                  </div>
                ))}
                {form.assets?.images?.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                    <span className="text-[10px]">No images yet</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </div>

            {/* Video management */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Product Videos</p>
              <div className="flex flex-col gap-2">
                {(form.assets?.videos || []).map((url: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted/40 rounded border text-xs group">
                    <span className="flex-1 truncate text-muted-foreground">{url}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeVideo(i)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Paste Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="h-8" />
                <Button type="button" variant="outline" size="sm" onClick={addVideo} className="h-8">Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/20 -mx-6 -mb-6 p-6 border-t mt-4 rounded-b-lg">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending} className="volt-gradient min-w-[100px]">
              {upsert.isPending ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
