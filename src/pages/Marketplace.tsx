import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useProfile } from "@/hooks/useProfile";
import { formatNaira } from "@/lib/utils";
import { Link2, Filter, Search, PackageOpen, Loader2, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type ProductCategory = "gadgets" | "telco" | "fintech" | "events" | "fashion" | "courses";

const categoryLabels: Record<ProductCategory, string> = {
  gadgets: "Gadgets",
  telco: "Telco",
  fintech: "Fintech",
  events: "Events",
  fashion: "Fashion",
  courses: "Courses",
};

const categoryColors: Record<ProductCategory, string> = {
  gadgets: "bg-primary/10 text-primary border-primary/20",
  telco: "bg-success/10 text-success border-success/20",
  fintech: "bg-warning/10 text-warning border-warning/20",
  events: "bg-destructive/10 text-destructive border-destructive/20",
  fashion: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  courses: "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

const Marketplace = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: profile } = useProfile();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"commission" | "name">("commission");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === "commission" ? b.commissionRate - a.commissionRate : a.name.localeCompare(b.name));

  const getLink = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const code = profile?.referral_code || "VOLT";
    navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug}?ref=${code}`);
    toast.success(`Link copied for ${product.name}!`);
  };

  const categories: (ProductCategory | "all")[] = ["all", "gadgets", "telco", "fintech", "events", "fashion", "courses"];

  // Category counts
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl md:text-3xl font-bold font-display">Marketplace</h1>
        <span className="text-sm text-muted-foreground">{filtered.length} products</span>
      </div>

      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "volt-gradient h-8 text-xs" : "h-8 text-xs"}>
              {cat === "all" ? `All (${products.length})` : `${categoryLabels[cat]} (${categoryCounts[cat] || 0})`}
            </Button>
          ))}
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setSortBy(sortBy === "commission" ? "name" : "commission")} className="text-muted-foreground h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" /> Sort: {sortBy === "commission" ? "Commission %" : "Name"}
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No products found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} className="block">
              <Card className="border-border/50 group hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden h-full">
                {/* Hero image with overlay */}
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={4 / 3}>
                    {product.assets?.images?.length > 0 ? (
                      <img
                        src={product.assets.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-5xl">{product.image}</span>
                      </div>
                    )}
                  </AspectRatio>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <div className="bg-background/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                        <Eye className="h-4 w-4 text-foreground" />
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${categoryColors[product.category]} text-[10px] px-1.5 py-0 absolute top-2 right-2 backdrop-blur-sm bg-background/70`}>
                    {categoryLabels[product.category]}
                  </Badge>
                </div>
                {/* Details */}
                <CardContent className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{product.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {product.price > 0 && <p className="text-xs text-muted-foreground">{formatNaira(product.price)}</p>}
                      <p className="text-sm font-bold text-primary">{product.commissionRate}%</p>
                    </div>
                    <Button size="sm" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem({
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        image: product.image,
                        imageUrl: product.assets?.images?.[0],
                        price: product.price,
                        commissionRate: product.commissionRate,
                      });
                      toast.success(`${product.name} added to cart!`);
                    }} className="volt-gradient text-xs h-8 px-3 shadow-md hover:shadow-lg transition-shadow">
                      <ShoppingCart className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
