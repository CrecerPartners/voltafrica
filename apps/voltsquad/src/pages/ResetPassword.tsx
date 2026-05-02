import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@digihire/shared";
import { Input } from "@digihire/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@digihire/shared";
import { Zap, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@digihire/shared";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check if already in recovery from URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        setSuccess(true);
        toast.success("Password updated successfully!");
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Invalid or expired reset link.</p>
            <Button
              variant="link"
              className="mt-2 text-primary"
              onClick={() => navigate("/forgot-password")}
            >
              Request a new one
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl volt-gradient volt-glow">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-display">
              {success ? "Password Updated!" : "Set New Password"}
            </CardTitle>
            <CardDescription className="mt-2">
              {success
                ? "Redirecting you to the dashboard..."
                : "Enter your new password below"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary border-border"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full volt-gradient font-semibold" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

