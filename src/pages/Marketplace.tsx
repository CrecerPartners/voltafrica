import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products, Product, ProductCategory, formatNaira } from "@/data/mockData";
import { Link2, Filter } from "lucide-react";
import { toast } from "sonner";

const categoryLabels: Record<ProductCategory, string> = {
  physical: "Physical",
  digital: "Digital",
  fintech: "Fintech",
  events: "Events",
};

const categoryColors: Record<ProductCategory, string> = {
  physical: "bg-warning/10 text-warning border-warning/20",
  digital: "bg-primary/10 text-primary border-primary/20",
  fintech: "bg-success/10 text-success border-success/20",
  events: "bg-destructive/10 text-destructive border-destructive/20",
};

const Marketplace = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"commission" | "name">("commission");

  const filtered = products
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .sort((a, b) => sortBy === "commission" ? b.commissionRate - a.commissionRate : a.name.localeCompare(b.name));

  const getLink = (product: Product) => {
    navigator.clipboard.writeText(`https://volt.ng/ref/VOLT-CHID23/${product.id}`);
    toast.success(`Link copied for ${product.name}!`);
  };

  const categories: (ProductCategory | "all")[] = ["all", "physical", "digital", "fintech", "events"];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Marketplace</h1>
        <p className="text-muted-foreground mt-1">Browse products and get your unique referral links</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? "volt-gradient" : ""}
          >
            {cat === "all" ? "All" : categoryLabels[cat]}
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === "commission" ? "name" : "commission")}
            className="text-muted-foreground"
          >
            <Filter className="h-3 w-3 mr-1" />
            Sort: {sortBy === "commission" ? "Commission %" : "Name"}
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="border-border/50 group hover:border-primary/30 transition-colors">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="text-3xl">{product.image}</div>
                <Badge variant="outline" className={categoryColors[product.category]}>
                  {categoryLabels[product.category]}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between pt-1">
                <div>
                  {product.price > 0 && (
                    <p className="text-xs text-muted-foreground">{formatNaira(product.price)}</p>
                  )}
                  <p className="text-sm font-bold text-primary">{product.commissionRate}% commission</p>
                </div>
                <Button size="sm" onClick={() => getLink(product)} className="volt-gradient text-xs">
                  <Link2 className="h-3 w-3 mr-1" />
                  Get Link
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
