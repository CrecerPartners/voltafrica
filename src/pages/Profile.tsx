import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfile";
import { useMyShopItems, useRemoveFromShop } from "@/hooks/useSellerShop";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { User, Building, Phone, CreditCard, Save, Loader2, Camera, Store, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/shareUtils";

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const Profile = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const { data: shopItemIds = [] } = useMyShopItems();
  const { data: allProducts = [] } = useProducts();
  const removeFromShop = useRemoveFromShop();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    university: "",
    whatsapp: "",
    bank_name: "",
    account_number: "",
    bio: "",
    shop_name: "",
  });

  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      university: profile.university || "",
      whatsapp: profile.whatsapp || "",
      bank_name: profile.bank_name || "",
      account_number: profile.account_number || "",
      bio: profile.bio || "",
      shop_name: profile.shop_name || "",
    });
    setInitialized(true);
  }

  const shopSlug = generateSlug(form.shop_name || form.name || "");
  const shopLink = shopSlug ? `${window.location.origin}/s/${shopSlug}` : "";
  const shopProducts = allProducts.filter(p => shopItemIds.includes(p.id));

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        ...form,
        shop_slug: shopSlug || null,
      } as any);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const Field = ({ label, icon: Icon, name, type = "text" }: { label: string; icon: any; name: keyof typeof form; type?: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-3 w-3 text-muted-foreground" /> {label}
      </label>
      <Input
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="bg-secondary border-border"
      />
    </div>
  );

  const initials = (profile?.name || "").split(" ").map(n => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="h-16 w-16 text-2xl">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-primary font-bold font-display text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadAvatar.isPending ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <p className="font-semibold text-lg">{profile?.name || "—"}</p>
            <p className="text-sm text-muted-foreground">{profile?.university || "—"}</p>
            <p className="text-xs text-primary font-medium mt-1">Tier: {profile?.tier || "Bronze"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-display font-semibold">Personal Information</h3>
          <Field label="Full Name" icon={User} name="name" />
          <Field label="Email" icon={User} name="email" type="email" />
          <Field label="University" icon={Building} name="university" />
          <Field label="WhatsApp Number" icon={Phone} name="whatsapp" type="tel" />
        </CardContent>
      </Card>

      {/* Shop Settings */}
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-display font-semibold flex items-center gap-2">
            <Store className="h-4 w-4" /> My Shop
          </h3>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Store className="h-3 w-3 text-muted-foreground" /> Shop Name
            </label>
            <Input
              value={form.shop_name}
              onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              placeholder="e.g. Ada's Picks"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell buyers about yourself..."
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          </div>
          {shopSlug && (
            <div className="flex items-center gap-2">
              <Input value={shopLink} readOnly className="bg-muted text-xs font-mono" />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(shopLink, "Shop link")}>
                <Link2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* My Shop Products */}
          {shopProducts.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground">{shopProducts.length} product{shopProducts.length !== 1 ? "s" : ""} in your shop</p>
              <div className="space-y-2">
                {shopProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-card">
                    {p.assets?.images?.[0] ? (
                      <img src={p.assets.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <span className="text-2xl">{p.image}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => {
                      removeFromShop.mutate(p.id, {
                        onSuccess: () => toast.success(`Removed ${p.name} from shop`),
                      });
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-display font-semibold">Payout Details</h3>
          <Field label="Bank Name" icon={CreditCard} name="bank_name" />
          <Field label="Account Number" icon={CreditCard} name="account_number" />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="volt-gradient w-full sm:w-auto" disabled={updateProfile.isPending}>
        <Save className="h-4 w-4 mr-2" /> {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default Profile;
