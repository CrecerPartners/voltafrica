import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useMyShopItems, useAddToShop, useRemoveFromShop } from "@/hooks/useSellerShop";
import { formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ImageLightbox } from "@/components/ImageLightbox";
import { SharePopover } from "@/components/SharePopover";
import { shareContent, canNativeShare, copyToClipboard } from "@/lib/shareUtils";
import {
  Link2, Share2, Lightbulb, Copy, MessageCircle, Instagram, Twitter,
  ChevronLeft, Loader2, ShoppingCart, ExternalLink, Zap, Store, Check, Download
} from "lucide-react";
import { ReviewSection } from "@/components/ReviewSection";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  gadgets: "bg-primary/10 text-primary border-primary/20",
  telco: "bg-success/10 text-success border-success/20",
  fintech: "bg-warning/10 text-warning border-warning/20",
  events: "bg-destructive/10 text-destructive border-destructive/20",
  fashion: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  courses: "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");
  const { user } = useAuth();

  const { data: product, isLoading, error } = useProduct(slug);
  const { data: products = [] } = useProducts();
  const { data: profile } = useProfile();
  const { addItem } = useCart();
  const { data: shopItemIds = [] } = useMyShopItems();
  const addToShop = useAddToShop();
  const removeFromShop = useRemoveFromShop();

  const [activeThumb, setActiveThumb] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isLoggedIn = !!user;
  const userRefCode = profile?.referral_code || refCode || "VOLT";
  const referralLink = product ? `${window.location.origin}/product/${product.slug}?ref=${userRefCode}` : "";

  // Store referral code for attribution on sign-up
  useEffect(() => {
    if (refCode) {
      localStorage.setItem("volt_ref_code", refCode);
    }
  }, [refCode]);

  const related = products.filter(p => product && p.category === product.category && p.id !== product.id).slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <p className="text-sm text-muted-foreground mt-1">This product may have been removed.</p>
        <Link to="/marketplace">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.assets?.images?.length > 0 ? product.assets.images : [];
  const shareText = `${product.name} — ${product.description}\n\n${referralLink}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Image Carousel */}
        <div className="space-y-3">
          {images.length > 0 ? (
            <>
              <div
                className="rounded-2xl overflow-hidden border border-border/50 bg-muted/30 cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <AspectRatio ratio={4 / 3}>
                  <img
                    src={images[activeThumb]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveThumb(i)}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all w-16 h-16 ${
                        i === activeThumb ? "border-primary ring-2 ring-primary/30" : "border-border/50 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-muted/30 flex items-center justify-center aspect-[4/3]">
              <span className="text-7xl">{product.image}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className={categoryColors[product.category] || "bg-muted text-muted-foreground"}>
                {product.category}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
          </div>

          <div className="flex items-baseline gap-3">
            {product.price > 0 && (
              <span className="text-2xl font-bold text-foreground">{formatNaira(product.price)}</span>
            )}
            {isLoggedIn && (
              <Badge className="volt-gradient text-primary-foreground text-sm px-3 py-1">
                {product.commissionRate}% commission
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            {/* Add to cart for everyone */}
            <Button
              className="w-full volt-gradient h-12 text-base"
              onClick={() => {
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
              }}
            >
              <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart — {formatNaira(product.price)}
            </Button>

            {isLoggedIn ? (
              <>
                <Button variant="outline" className="w-full h-10" onClick={() => copyToClipboard(referralLink, "Share link")}>
                  <Link2 className="h-4 w-4 mr-2" /> Copy My Share Link
                </Button>
                {canNativeShare() ? (
                  <Button variant="outline" className="w-full h-10" onClick={() => shareContent(product.name, shareText, referralLink)}>
                    <Share2 className="h-4 w-4 mr-2" /> Share to Earn
                  </Button>
                ) : (
                  <SharePopover
                    text={shareText}
                    url={referralLink}
                    triggerClassName="w-full h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md gap-2"
                  />
                )}
                <Button
                  variant={shopItemIds.includes(product.id) ? "secondary" : "outline"}
                  className="w-full h-10"
                  onClick={() => {
                    const inShop = shopItemIds.includes(product.id);
                    if (inShop) {
                      removeFromShop.mutate(product.id, { onSuccess: () => toast.success("Removed from My Shop") });
                    } else {
                      addToShop.mutate(product.id, { onSuccess: () => toast.success("Added to My Shop!") });
                    }
                  }}
                >
                  {shopItemIds.includes(product.id) ? <Check className="h-4 w-4 mr-2" /> : <Store className="h-4 w-4 mr-2" />}
                  {shopItemIds.includes(product.id) ? "In My Shop" : "Add to My Shop"}
                </Button>
              </>
            ) : (
              <Button variant="outline" className="w-full h-10" asChild>
                <Link to="/login">
                  <Zap className="h-4 w-4 mr-2" /> Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Video */}
          {product.assets.videoUrl && (
            <Button variant="outline" className="w-full" onClick={() => window.open(product.assets.videoUrl, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" /> Watch Promo Video
            </Button>
          )}

          {/* Seller-only tools */}
          {isLoggedIn && (
            <>
              {/* Social Captions */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-foreground">Ready-made Captions</h3>
                <CaptionCard icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" text={product.assets.whatsappMessage} link={referralLink} productName={product.name} />
                <CaptionCard icon={<Instagram className="h-4 w-4" />} label="Instagram" text={product.assets.instagramCaption} link={referralLink} productName={product.name} />
                <CaptionCard icon={<Twitter className="h-4 w-4" />} label="Twitter / X" text={product.assets.twitterCaption} link={referralLink} productName={product.name} />
              </div>

              {/* Selling Tips */}
              {product.assets.sellingTips?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-warning" /> Selling Tips
                  </h3>
                  <ul className="space-y-2">
                    {product.assets.sellingTips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={product.id} />

      {/* Media Kit (seller-only) */}
      {isLoggedIn && images.length > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Media Kit
            </h3>
            <p className="text-xs text-muted-foreground">Download product images and copy descriptions for your social posts.</p>
            <div className="flex flex-wrap gap-2">
              {images.map((url: string, i: number) => (
                <a key={i} href={url} download={`${product.slug}-${i + 1}.jpg`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    <Download className="h-3 w-3 mr-1" /> Image {i + 1}
                  </Button>
                </a>
              ))}
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                const kit = `${product.name}\n${product.description}\n\nPrice: ₦${product.price}\n\n${referralLink}`;
                navigator.clipboard.writeText(kit);
                toast.success("Media kit text copied!");
              }}>
                <Copy className="h-3 w-3 mr-1" /> Copy All Text
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold font-display text-foreground">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {related.map(p => (
              <Link key={p.id} to={`/product/${p.slug}`}>
                <Card className="border-border/50 group hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className="overflow-hidden">
                    <AspectRatio ratio={4 / 3}>
                      {p.assets?.images?.length > 0 ? (
                        <img src={p.assets.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center"><span className="text-3xl">{p.image}</span></div>
                      )}
                    </AspectRatio>
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <h3 className="font-semibold text-sm leading-tight truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                    <p className="text-sm font-bold text-primary">{p.commissionRate}%</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={activeThumb}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          productName={product.name}
          referralLink={referralLink}
        />
      )}
    </div>
  );
};

function CaptionCard({ icon, label, text, link, productName }: {
  icon: React.ReactNode; label: string; text: string; link: string; productName: string;
}) {
  const full = `${text}\n\n${link}`;
  return (
    <div className="rounded-xl border border-border/50 p-3 space-y-2 bg-card">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">{icon} {label}</div>
      <p className="text-xs text-foreground line-clamp-3">{text}</p>
      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => copyToClipboard(full, `${label} caption`)}>
          <Copy className="h-3 w-3 mr-1" /> Copy
        </Button>
        {canNativeShare() ? (
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => shareContent(productName, full, link)}>
            <Share2 className="h-3 w-3" />
          </Button>
        ) : (
          <SharePopover text={full} url={link} triggerClassName="text-xs h-7 border border-input bg-background hover:bg-accent rounded-md px-2 inline-flex items-center" />
        )}
      </div>
    </div>
  );
}

export default ProductPage;
