import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, formatNaira } from "@/data/mockData";
import { Calculator, Plus, Trash2, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";

interface PlanItem {
  productId: string;
  quantity: number;
}

const motivationalMessages = [
  { threshold: 0, message: "Add products to see your earning potential! 💡" },
  { threshold: 5000, message: "Great start! That covers a month of data 📱" },
  { threshold: 15000, message: "Nice! You could buy a new pair of sneakers 👟" },
  { threshold: 30000, message: "Amazing! That's a new phone territory 📲" },
  { threshold: 50000, message: "You'd be on track for Gold tier! 🥇" },
  { threshold: 100000, message: "Incredible! That's a whole semester's pocket money 🎓" },
  { threshold: 200000, message: "Legend status! You're basically running a business 🚀" },
];

const getMotivation = (total: number) => {
  let msg = motivationalMessages[0].message;
  for (const m of motivationalMessages) {
    if (total >= m.threshold) msg = m.message;
  }
  return msg;
};

const Calculator_Page = () => {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const addItem = () => {
    if (!selectedProduct) return toast.error("Select a product first");
    if (quantity < 1) return toast.error("Quantity must be at least 1");

    const existing = items.find((i) => i.productId === selectedProduct);
    if (existing) {
      setItems(items.map((i) => i.productId === selectedProduct ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      setItems([...items, { productId: selectedProduct, quantity }]);
    }
    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const getProduct = (id: string) => products.find((p) => p.id === id)!;

  const calculateCommission = (item: PlanItem) => {
    const p = getProduct(item.productId);
    return item.quantity * p.price * (p.commissionRate / 100);
  };

  const totalEarnings = items.reduce((sum, item) => sum + calculateCommission(item), 0);
  const totalSales = items.reduce((sum, item) => sum + item.quantity, 0);

  const sharePlan = () => {
    const lines = items.map((item) => {
      const p = getProduct(item.productId);
      return `• ${p.name} x${item.quantity} = ${formatNaira(calculateCommission(item))}`;
    });
    const text = `🔥 My Volt Earnings Plan\n\n${lines.join("\n")}\n\n💰 Total: ${formatNaira(totalEarnings)} from ${totalSales} sales!\n\nJoin Volt and start earning too! ⚡`;
    navigator.clipboard.writeText(text);
    toast.success("Plan copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Earnings Calculator</h1>
        <p className="text-muted-foreground mt-1">See how much you could earn selling products</p>
      </div>

      {/* Add Product */}
      <Card className="border-border/50">
        <CardContent className="p-4 md:p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Build Your Sales Plan
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.image} {p.name} — {p.commissionRate}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full sm:w-24"
              placeholder="Qty"
            />
            <Button onClick={addItem} className="volt-gradient">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4 md:p-6 space-y-3">
            <h3 className="text-sm font-semibold">Your Sales Plan</h3>
            {items.map((item) => {
              const p = getProduct(item.productId);
              const commission = calculateCommission(item);
              return (
                <div key={item.productId} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl">{p.image}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNaira(p.price)} × {item.quantity} @ {p.commissionRate}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-primary">{formatNaira(commission)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Total */}
      <Card className="border-primary/30 volt-glow">
        <CardContent className="p-5 md:p-6 text-center space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Projected Earnings</p>
          <p className="text-3xl sm:text-4xl font-bold font-display text-primary">{formatNaira(totalEarnings)}</p>
          <p className="text-sm text-muted-foreground">
            from {totalSales} sale{totalSales !== 1 ? "s" : ""} across {items.length} product{items.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Sparkles className="h-4 w-4 text-warning" />
            <p className="text-sm font-medium">{getMotivation(totalEarnings)}</p>
          </div>
          <div className="flex justify-center gap-3 pt-3">
            {items.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => setItems([])}>Clear All</Button>
                <Button size="sm" className="volt-gradient" onClick={sharePlan}>
                  <Share2 className="h-3 w-3 mr-1" /> Share Plan
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator_Page;
