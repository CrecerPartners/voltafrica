import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Gift, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import OtpVerification from "@/components/OtpVerification";

const sellerTypes = [
  "Student",
  "NYSC member",
  "Fresh grad",
  "Micro-influencer",
  "Content creator",
  "Young urban youth seller",
];

const cities = [
  "Lagos", "Ibadan", "Abeokuta", "Ile-Ife", "Osogbo", "Akure", "Ado-Ekiti",
  "Ilorin", "Abuja", "Kano", "Kaduna", "Zaria", "Jos", "Benin City", "Asaba",
  "Warri", "Port Harcourt", "Uyo", "Calabar", "Owerri", "Enugu", "Aba",
  "Nsukka", "Makurdi", "Yola", "Bauchi", "Gombe", "Sokoto", "Minna",
];

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp, signIn, signOut, verifyOtp, resendSignupOtp, sendLoginOtp, resendLoginOtp } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const isJoinNow = location.pathname === "/join-now";
  const [isSignup, setIsSignup] = useState(isJoinNow);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sellerType, setSellerType] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (!firstName.trim() || !lastName.trim()) {
          toast.error("First name and last name are required");
          return;
        }
        if (!sellerType) {
          toast.error("Please select what best describes you");
          return;
        }
        if (!city) {
          toast.error("Please select your city");
          return;
        }
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const university = `${sellerType} — ${city}`;
        const { error } = await signUp(email, password, fullName, university, sellerType);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Verification code sent to your email!");
          setStep("otp");
        }
      } else {
        // Login: validate password first
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          // Password valid — sign out and send OTP for second-factor verification
          await signOut();
          const { error: otpError } = await sendLoginOtp(email);
          if (otpError) {
            toast.error(otpError.message);
          } else {
            toast.success("Verification code sent to your email!");
            setStep("otp");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (token: string) => {
    setLoading(true);
    try {
      const otpType = isSignup ? "signup" : "email";
      const { error } = await verifyOtp(email, token, otpType);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(isSignup ? "Email verified! Welcome to Volt ⚡" : "Verified! Welcome back ⚡");
        navigate("/dashboard", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSignup) {
      const { error } = await resendSignupOtp(email);
      if (error) throw error;
    } else {
      const { error } = await resendLoginOtp(email);
      if (error) throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="sm" onClick={() => step === "otp" ? setStep("form") : navigate("/")} className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50">
        {step === "otp" ? (
          <CardContent className="pt-8 pb-6">
            <OtpVerification
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBack={() => setStep("form")}
              loading={loading}
            />
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl volt-gradient volt-glow">
                  <Zap className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-display">
                  {isSignup ? "Join the Volt Network ⚡" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="mt-2">
                  {isSignup ? "Start earning as a Volt seller" : "Sign in to your dashboard"}
                </CardDescription>
              </div>
              {isSignup && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">Get ₦500 signup bonus!</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">First Name <span className="text-destructive">*</span></label>
                      <Input placeholder="Chidera" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary border-border" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Last Name <span className="text-destructive">*</span></label>
                      <Input placeholder="Okafor" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary border-border" required />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                  <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password <span className="text-destructive">*</span></label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" required minLength={6} />
                </div>
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">What best describes you? <span className="text-destructive">*</span></label>
                      <Select value={sellerType} onValueChange={setSellerType} required>
                        <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select your category" /></SelectTrigger>
                        <SelectContent>{sellerTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">What city are you based in? <span className="text-destructive">*</span></label>
                      <Select value={city} onValueChange={setCity} required>
                        <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select your city" /></SelectTrigger>
                        <SelectContent>{cities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {!isSignup && (
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                  </div>
                )}
                <Button type="submit" className="w-full volt-gradient font-semibold" disabled={loading}>
                  {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button onClick={() => { setIsSignup(!isSignup); setStep("form"); }} className="text-primary font-medium hover:underline">
                  {isSignup ? "Sign In" : "Join Now"}
                </button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Login;
