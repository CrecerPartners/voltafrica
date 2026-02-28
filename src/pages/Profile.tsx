import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/data/mockData";
import { User, Building, Phone, CreditCard, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [form, setForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    university: currentUser.university,
    whatsapp: currentUser.whatsapp,
    bankName: currentUser.bankName,
    accountNumber: currentUser.accountNumber,
  });

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details</p>
      </div>

      {/* Avatar */}
      <Card className="border-border/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold font-display text-primary">
            {currentUser.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="font-semibold text-lg">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.university}</p>
            <p className="text-xs text-primary font-medium mt-1">Tier: {currentUser.tier} · Joined {currentUser.joinedDate}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full Name" icon={User} name="name" />
          <Field label="Email" icon={User} name="email" type="email" />
          <Field label="University" icon={Building} name="university" />
          <Field label="WhatsApp Number" icon={Phone} name="whatsapp" type="tel" />
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Payout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Bank Name" icon={CreditCard} name="bankName" />
          <Field label="Account Number" icon={CreditCard} name="accountNumber" />
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="volt-gradient w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" /> Save Changes
      </Button>
    </div>
  );
};

export default Profile;
