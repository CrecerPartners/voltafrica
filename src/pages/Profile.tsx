import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { User, Building, Phone, CreditCard, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    university: "",
    whatsapp: "",
    bank_name: "",
    account_number: "",
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
    });
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(form);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
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
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold font-display text-primary">
            {initials}
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
