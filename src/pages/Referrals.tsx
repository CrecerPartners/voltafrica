import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currentUser, referrals, formatNaira } from "@/data/mockData";
import { Copy, Share2, Users, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  signed_up: "text-warning border-warning/20",
  active: "text-primary border-primary/20",
  earned: "text-success border-success/20",
};

const Referrals = () => {
  const totalBonus = referrals.reduce((sum, r) => sum + r.earnings, 0);

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    toast.success("Referral code copied!");
  };

  const shareLink = () => {
    navigator.clipboard.writeText(currentUser.referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display">Referral Center</h1>
        <p className="text-muted-foreground mt-1">Invite friends and earn bonuses</p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-primary/30 volt-glow">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Your Referral Code</p>
          <p className="text-3xl md:text-4xl font-bold font-display tracking-widest text-primary">
            {currentUser.referralCode}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={copyCode} variant="outline" size="sm">
              <Copy className="h-3 w-3 mr-1" /> Copy Code
            </Button>
            <Button onClick={shareLink} size="sm" className="volt-gradient">
              <Share2 className="h-3 w-3 mr-1" /> Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold font-display">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
            <p className="text-2xl font-bold font-display">{referrals.filter(r => r.status !== "signed_up").length}</p>
            <p className="text-xs text-muted-foreground">Active Signups</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Gift className="h-5 w-5 mx-auto text-warning mb-1" />
            <p className="text-2xl font-bold font-display">{formatNaira(totalBonus)}</p>
            <p className="text-xs text-muted-foreground">Bonus Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral List */}
      <Card className="border-border/50">
        <CardContent className="p-4 md:p-6">
          <h3 className="text-sm font-semibold mb-4">Referred Students</h3>
          <div className="space-y-3">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  {r.earnings > 0 && (
                    <span className="text-sm font-semibold text-success">+{formatNaira(r.earnings)}</span>
                  )}
                  <Badge variant="outline" className={statusColors[r.status]}>
                    {r.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;
