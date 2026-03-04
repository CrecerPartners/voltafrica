import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { useUpdateSale, Sale } from "@/hooks/useSales";
import { formatNaira } from "@/lib/utils";
import { Calculator, Loader2 } from "lucide-react";

interface EditSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
}

export function EditSaleDialog({ open, onOpenChange, sale }: EditSaleDialogProps) {
  const { data: products = [] } = useProducts();
  const updateSale = useUpdateSale();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [conversionStatus, setConversionStatus] = useState("clicked");

  useEffect(() => {
    if (sale) {
      setProductId(sale.product_id || "");
      setQuantity(sale.quantity);
      setPrice(sale.amount > 0 ? sale.amount / sale.quantity : "");
      setCustomer(sale.customer);
      setNotes(sale.notes || "");
      setConversionStatus(sale.conversion_status || "clicked");
    }
  }, [sale]);

  const selectedProduct = products.find((p) => p.id === productId);
  const isLead = selectedProduct?.productType === "lead";
  const effectivePrice = typeof price === "number" ? price : (selectedProduct?.price ?? 0);

  const commission = selectedProduct
    ? selectedProduct.commissionModel === "percentage"
      ? quantity * effectivePrice * (selectedProduct.commissionRate / 100)
      : selectedProduct.commissionRate
    : 0;

  const handleSubmit = () => {
    if (!sale) return;
    updateSale.mutate({
      id: sale.id,
      data: {
        product_id: productId || null,
        quantity: isLead ? 1 : quantity,
        amount: isLead ? 0 : effectivePrice * quantity,
        commission: isLead ? 0 : commission,
        customer: isLead ? "Lead" : customer,
        notes,
        conversion_status: isLead ? conversionStatus : null,
      },
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>Update your pending sale details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Product</label>
            <Select value={productId} onValueChange={(v) => { setProductId(v); const p = products.find(x => x.id === v); if (p) setPrice(p.price); }}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLead ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Conversion Status</label>
              <Select value={conversionStatus} onValueChange={setConversionStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="signed_up">Signed Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Price (₦)</label>
                <Input type="number" min={0} value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || "")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Customer</label>
                <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {selectedProduct && !isLead && (
            <div className="rounded-lg bg-secondary p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>Estimated Commission</span>
              </div>
              <p className="text-sm font-bold text-primary">{formatNaira(commission)}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="volt-gradient" onClick={handleSubmit} disabled={updateSale.isPending}>
            {updateSale.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
