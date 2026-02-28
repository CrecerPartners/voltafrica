import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, formatNaira, Transaction } from "@/data/mockData";
import { Upload, Calculator } from "lucide-react";
import { toast } from "sonner";

interface ManualSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (transaction: Transaction) => void;
}

export function ManualSaleDialog({ open, onOpenChange, onSubmit }: ManualSaleDialogProps) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);
  const commission = selectedProduct
    ? quantity * selectedProduct.price * (selectedProduct.commissionRate / 100)
    : 0;

  const handleSubmit = () => {
    if (!productId) return toast.error("Select a product");
    if (!customer.trim()) return toast.error("Enter customer name");
    if (!proofFile) return toast.error("Upload proof of sale");

    const tx: Transaction = {
      id: `manual_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "manual_sale",
      description: `${selectedProduct!.name} x${quantity} — ${customer}`,
      amount: commission,
      status: "pending",
      proofFileName: proofFile.name,
    };

    onSubmit(tx);
    toast.success("Sale logged! It'll appear as pending until reviewed.");
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setProductId("");
    setQuantity(1);
    setCustomer("");
    setNotes("");
    setProofFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log a Sale</DialogTitle>
          <DialogDescription>
            Record an offline sale. It will be marked as pending until verified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Product</label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product sold" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.image} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quantity</label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Customer Name</label>
              <Input
                placeholder="e.g. Bola A."
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>
          </div>

          {/* Proof Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Proof of Sale</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => document.getElementById("proof-upload")?.click()}
              >
                <Upload className="h-3 w-3 mr-2" />
                {proofFile ? proofFile.name : "Upload receipt / screenshot"}
              </Button>
              <input
                id="proof-upload"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <Textarea
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Commission Preview */}
          {selectedProduct && (
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
          <Button className="volt-gradient" onClick={handleSubmit}>Submit Sale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
