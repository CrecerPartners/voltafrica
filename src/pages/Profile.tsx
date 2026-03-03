import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfile";
import { useMyShopItems, useRemoveFromShop } from "@/hooks/useSellerShop";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/utils";
import {
  User, Building, Phone, CreditCard, Save, Loader2, Camera,
  Store, Link2, Trash2, ExternalLink, ShoppingBag, Copy,
  CircleCheck, CircleAlert, Settings, Upload, ShieldCheck,
  Instagram, AtSign, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/shareUtils";

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const Profile = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { data: shopItemIds = [] } = useMyShopItems();
  const { data: allProducts = [] } = useProducts();
  const removeFromShop = useRemoveFromShop();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: "", email: "", whatsapp: "",
    bank_name: "", account_number: "",
    account_type: "", social_links: { tiktok: "", snapchat: "", instagram: "", twitter: "" },
  });

  const [shopForm, setShopForm] = useState({ shop_name: "", shop_slug: "", bio: "" });
  const [initialized, setInitialized] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const deriveAccountType = (university: string): string => {
    const raw = university?.split(" — ")[0]?.trim() || "";
    const map: Record<string, string> = {
      "Student": "student", "NYSC member": "nysc", "Fresh grad": "graduate",
      "Corporate": "corporate", "Micro-influencer": "creator",
      "Content creator": "creator", "Young urban youth seller": "creator",
    };
    return map[raw] || "";
  };

  if (profile && !initialized) {
    const sl = profile.social_links || {};
    const accountType = profile.account_type || deriveAccountType(profile.university);
    setProfileForm({
      name: profile.name || "", email: profile.email || "",
      whatsapp: profile.whatsapp || "",
      bank_name: profile.bank_name || "", account_number: profile.account_number || "",
      account_type: accountType,
      social_links: { tiktok: sl.tiktok || "", snapchat: sl.snapchat || "", instagram: sl.instagram || "", twitter: sl.twitter || "" },
    });
    setShopForm({
      shop_name: profile.shop_name || "",
      shop_slug: profile.shop_slug || toSlug(profile.shop_name || profile.name || ""),
      bio: profile.bio || "",
    });
    setInitialized(true);
  }

  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => {
    if (!slugTouched && shopForm.shop_name) {
      setShopForm(f => ({ ...f, shop_slug: toSlug(f.shop_name) }));
    }
  }, [shopForm.shop_name, slugTouched]);

  const shopSlug = shopForm.shop_slug;
  const shopLink = shopSlug ? `${window.location.origin}/s/${shopSlug}` : "";
  const shopProducts = allProducts.filter(p => shopItemIds.includes(p.id));
  const referralCode = profile?.referral_code || "VOLT";
  const isShopLive = !!profile?.shop_slug && shopProducts.length > 0;

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        ...profileForm,
        social_links: profileForm.social_links,
      } as any);
      toast.success("Profile saved!");
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
  };

  const handleSaveShop = async () => {
    if (!shopForm.shop_slug) { toast.error("Please set a shop URL slug"); return; }
    try {
      await updateProfile.mutateAsync({ shop_name: shopForm.shop_name, shop_slug: shopForm.shop_slug, bio: shopForm.bio } as any);
      toast.success("Shop settings saved!");
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    try { await uploadAvatar.mutateAsync(file); toast.success("Avatar updated!"); }
    catch (err: any) { toast.error(err.message || "Failed to upload avatar"); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/logo.${ext}`;
      const { error } = await supabase.storage.from("shop-logos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("shop-logos").getPublicUrl(path);
      const shop_logo_url = urlData.publicUrl + "?t=" + Date.now();
      await updateProfile.mutateAsync({ shop_logo_url } as any);
      toast.success("Shop logo updated!");
    } catch (err: any) { toast.error(err.message || "Failed to upload logo"); }
    finally { setUploadingLogo(false); }
  };

  const handleIdDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setUploadingDoc(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/id-doc.${ext}`;
      const { error } = await supabase.storage.from("verification-docs").upload(path, file, { upsert: true });
      if (error) throw error;
      await updateProfile.mutateAsync({ id_document_url: path, verification_status: "pending" } as any);
      toast.success("ID document uploaded! Verification pending.");
    } catch (err: any) { toast.error(err.message || "Failed to upload document"); }
    finally { setUploadingDoc(false); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const initials = (profile?.name || "").split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  const isVerified = profile?.verification_status === "verified";
  const isPendingVerification = profile?.verification_status === "pending";
  const needsIdUpload = ["student", "corporate", "nysc"].includes(profileForm.account_type);
  const accountTypeLabels: Record<string, string> = {
    student: "Student", nysc: "NYSC Member", graduate: "Fresh Graduate",
    corporate: "Corporate", creator: "Creator / Influencer",
  };

  const ProfileField = ({ label, icon: Icon, name, type = "text" }: { label: string; icon: any; name: keyof typeof profileForm; type?: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2"><Icon className="h-3 w-3 text-muted-foreground" /> {label}</label>
      <Input type={type} value={profileForm[name] as string} onChange={(e) => setProfileForm({ ...profileForm, [name]: e.target.value })} className="bg-secondary border-border" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
          <Settings className="h-6 w-6" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile and shop</p>
      </div>

      {/* Avatar & Info */}
      <Card className="border-border/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="h-16 w-16 text-2xl">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.name} /> : null}
              <AvatarFallback className="bg-primary/20 text-primary font-bold font-display text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadAvatar.isPending ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg">{profile?.name || "—"}</p>
              {isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">{profile?.university || "—"}</p>
            <p className="text-xs text-primary font-medium mt-1">Tier: {profile?.tier || "Bronze"}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1"><User className="h-3.5 w-3.5 mr-1.5" /> Profile</TabsTrigger>
          <TabsTrigger value="shop" className="flex-1"><Store className="h-3.5 w-3.5 mr-1.5" /> My Shop</TabsTrigger>
        </TabsList>

        {/* ─── PROFILE TAB ─── */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-semibold">Personal Information</h3>
              <ProfileField label="Full Name" icon={User} name="name" />
              <ProfileField label="Email" icon={User} name="email" type="email" />
              <ProfileField label="WhatsApp Number" icon={Phone} name="whatsapp" type="tel" />
            </CardContent>
          </Card>

          {/* Account Type & Verification */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Verification
              </h3>

              {isVerified && (
                <Badge className="bg-primary/10 text-primary border-primary/20"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>
              )}
              {isPendingVerification && (
                <Badge variant="outline" className="text-warning border-warning/30"><CircleAlert className="h-3 w-3 mr-1" /> Pending Verification</Badge>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                {profileForm.account_type ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm py-1 px-3">{accountTypeLabels[profileForm.account_type] || profileForm.account_type}</Badge>
                    <span className="text-xs text-muted-foreground">Set during signup</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set — will be derived from your signup info</p>
                )}
              </div>

              {needsIdUpload && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Upload {profileForm.account_type === "student" ? "Student ID" : profileForm.account_type === "nysc" ? "NYSC ID / Call-up Letter" : "Corporate ID"}
                  </label>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" onClick={() => idDocInputRef.current?.click()} disabled={uploadingDoc}>
                      {uploadingDoc ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                      {profile?.id_document_url ? "Re-upload" : "Upload ID"}
                    </Button>
                    {profile?.id_document_url && <span className="text-xs text-muted-foreground">Document uploaded</span>}
                    <input ref={idDocInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIdDocUpload} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" /> Social Links
              </h3>
              <div className="space-y-3">
                {[
                  { key: "tiktok" as const, label: "TikTok", icon: AtSign },
                  { key: "snapchat" as const, label: "Snapchat", icon: AtSign },
                  { key: "instagram" as const, label: "Instagram", icon: Instagram },
                  { key: "twitter" as const, label: "Twitter / X", icon: AtSign },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Icon className="h-3 w-3 text-muted-foreground" /> {label}</label>
                    <Input
                      value={profileForm.social_links[key]}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        social_links: { ...profileForm.social_links, [key]: e.target.value },
                      })}
                      placeholder={`Your ${label} link or handle`}
                      className="bg-secondary border-border"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-display font-semibold">Payout Details</h3>
              <ProfileField label="Bank Name" icon={CreditCard} name="bank_name" />
              <ProfileField label="Account Number" icon={CreditCard} name="account_number" />
            </CardContent>
          </Card>

          <Button onClick={handleSaveProfile} className="volt-gradient w-full sm:w-auto" disabled={updateProfile.isPending}>
            <Save className="h-4 w-4 mr-2" /> {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </TabsContent>

        {/* ─── MY SHOP TAB ─── */}
        <TabsContent value="shop" className="space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-semibold flex items-center gap-2"><Store className="h-4 w-4" /> Shop Details</h3>
                <Badge variant={isShopLive ? "default" : "outline"} className={isShopLive ? "bg-green-500/15 text-green-600 border-green-500/30 text-xs" : "text-xs"}>
                  {isShopLive ? <><CircleCheck className="h-3 w-3 mr-1" /> Live</> : <><CircleAlert className="h-3 w-3 mr-1" /> Not set up</>}
                </Badge>
              </div>

              {/* Shop Logo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Logo / Picture</label>
                <div className="flex items-center gap-4">
                  {profile?.shop_logo_url ? (
                    <img src={profile.shop_logo_url} alt="Shop logo" className="h-16 w-16 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                      <Store className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <Button size="sm" variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                    {profile?.shop_logo_url ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Name</label>
                <Input value={shopForm.shop_name} onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })} placeholder="e.g. Ada's Picks" className="bg-secondary border-border" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Shop URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">/s/</span>
                  <Input value={shopForm.shop_slug} onChange={(e) => { setSlugTouched(true); setShopForm({ ...shopForm, shop_slug: toSlug(e.target.value) }); }} placeholder="my-shop" className="bg-secondary border-border font-mono text-sm" />
                </div>
                {shopSlug && <p className="text-xs text-muted-foreground font-mono truncate">{window.location.origin}/s/{shopSlug}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea value={shopForm.bio} onChange={(e) => setShopForm({ ...shopForm, bio: e.target.value })} placeholder="Tell buyers about yourself..." className="bg-secondary border-border resize-none" rows={3} />
              </div>

              {shopSlug && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(shopLink, "Shop link")}><Copy className="h-3 w-3 mr-1.5" /> Copy Link</Button>
                  <Button size="sm" variant="outline" asChild><a href={`/s/${shopSlug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1.5" /> Preview</a></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (navigator.share) navigator.share({ title: shopForm.shop_name || "My Shop", url: shopLink }); else copyToClipboard(shopLink, "Shop link"); }}><Link2 className="h-3 w-3 mr-1.5" /> Share</Button>
                  <Button size="sm" variant="outline" asChild><Link to="/marketplace"><ShoppingBag className="h-3 w-3 mr-1.5" /> Add Products</Link></Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-base font-display font-semibold">Shop Products{shopProducts.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({shopProducts.length})</span>}</h3>
              {shopProducts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center border border-dashed border-border rounded-lg">
                  <Store className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Add products from the marketplace</p>
                  <Button size="sm" variant="default" className="volt-gradient" asChild><Link to="/marketplace"><ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Browse Marketplace</Link></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {shopProducts.map((p) => {
                    const productLink = `${window.location.origin}/product/${p.slug}?ref=${referralCode}`;
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card">
                        {(p as any).assets?.images?.[0] ? (
                          <img src={(p as any).assets.images[0]} alt={p.name} className="h-12 w-12 rounded-md object-cover flex-shrink-0" />
                        ) : (
                          <span className="text-2xl flex-shrink-0">{p.image}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{p.brand}</span>
                            {p.price > 0 && <><span className="text-xs text-muted-foreground">•</span><span className="text-xs font-medium">{formatNaira(p.price)}</span></>}
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs font-semibold text-primary">{p.commissionRate}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyToClipboard(productLink, "Product link")}><Copy className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => { removeFromShop.mutate(p.id, { onSuccess: () => toast.success(`Removed ${p.name}`) }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSaveShop} className="volt-gradient w-full sm:w-auto" disabled={updateProfile.isPending}>
            <Save className="h-4 w-4 mr-2" /> {updateProfile.isPending ? "Saving..." : "Save Shop Settings"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
