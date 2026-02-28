import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Gift } from "lucide-react";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
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
              {isSignup ? "Join the Volt-Squad ⚡" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="mt-2">
              {isSignup
                ? "Start earning as a campus ambassador"
                : "Sign in to your dashboard"}
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input placeholder="Chidera Okafor" className="bg-secondary border-border" />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@university.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            {isSignup && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">University</label>
                <Input placeholder="University of Lagos" className="bg-secondary border-border" />
              </div>
            )}
            <Button type="submit" className="w-full volt-gradient font-semibold">
              {isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary font-medium hover:underline"
            >
              {isSignup ? "Sign In" : "Join Now"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
