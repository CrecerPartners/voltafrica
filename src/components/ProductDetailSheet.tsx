import { Product, formatNaira } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Copy, Link2, MessageCircle, Instagram, Lightbulb, Image } from "lucide-react";
import { toast } from "sonner";

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryColors: Record<string, string> = {
  physical: "bg-warning/10 text-warning border-warning/20",
  digital: "bg-primary/10 text-primary border-primary/20",
  fintech: "bg-success/10 text-success border-success/20",
  events: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ProductDetailSheet({ product, open, onOpenChange }: ProductDetailSheetProps) {
  if (!product) return null;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const referralLink = `https://volt.ng/ref/VOLT-CHID23/${product.id}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{product.image}</span>
            <div>
              <SheetTitle className="text-lg">{product.name}</SheetTitle>
              <SheetDescription>{product.brand}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Info */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={categoryColors[product.category]}>
              {product.category}
            </Badge>
            {product.price > 0 && (
              <Badge variant="secondary">{formatNaira(product.price)}</Badge>
            )}
            <Badge className="volt-gradient text-primary-foreground">
              {product.commissionRate}% commission
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{product.description}</p>

          {/* Product Images */}
          {product.assets.images.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" /> Product Images
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {product.assets.images.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-border/50">
                    <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity h-7"
                      onClick={() => copyText(url, "Image link")}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy Link
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Assets */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Sales Assets</h4>

            <div className="rounded-lg border border-border/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MessageCircle className="h-3 w-3" /> WhatsApp Message
              </div>
              <p className="text-xs text-foreground">{product.assets.whatsappMessage}</p>
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => copyText(product.assets.whatsappMessage + "\n" + referralLink, "WhatsApp message")}>
                <Copy className="h-3 w-3 mr-1" /> Copy for WhatsApp
              </Button>
            </div>

            <div className="rounded-lg border border-border/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Instagram className="h-3 w-3" /> Instagram Caption
              </div>
              <p className="text-xs text-foreground">{product.assets.instagramCaption}</p>
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => copyText(product.assets.instagramCaption, "Instagram caption")}>
                <Copy className="h-3 w-3 mr-1" /> Copy for Instagram
              </Button>
            </div>
          </div>

          {/* Selling Tips */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" /> Selling Tips
            </h4>
            <ul className="space-y-1.5">
              {product.assets.sellingTips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Get Link */}
          <Button className="w-full volt-gradient" onClick={() => copyText(referralLink, "Referral link")}>
            <Link2 className="h-4 w-4 mr-2" /> Get Referral Link
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
