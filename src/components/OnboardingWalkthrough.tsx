import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCog, ShoppingBag, Wallet, Copy, Banknote, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface OnboardingWalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode?: string;
}

const steps = [
  {
    icon: UserCog,
    title: "Set Up Your Profile",
    subtitle: "Add your photo, bio, and bank details so you're ready to earn.",
    action: "Go to Profile",
    route: "/profile",
  },
  {
    icon: ShoppingBag,
    title: "Browse Products",
    subtitle: "Explore products and add them to your shop to start selling.",
    action: "Browse Marketplace",
    route: "/marketplace",
  },
  {
    icon: Wallet,
    title: "Check Your Wallet",
    subtitle: "Your ₦500 signup bonus is already there! See your balance.",
    action: "View Wallet",
    route: "/wallet",
  },
  {
    icon: Copy,
    title: "Copy Your Referral Code",
    subtitle: "Share your code with friends and earn ₦500 per signup!",
    action: "Copy Code",
    route: null,
  },
  {
    icon: Banknote,
    title: "Request a Payout",
    subtitle: "Once you've earned enough, cash out to your bank account.",
    action: "Go to Wallet",
    route: "/wallet",
  },
  {
    icon: Trophy,
    title: "View Leaderboard",
    subtitle: "See how you rank against other Volt sellers nationwide.",
    action: "View Leaderboard",
    route: "/leaderboard",
  },
];

export function OnboardingWalkthrough({ open, onOpenChange, referralCode }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const step = steps[currentStep];

  const handleAction = () => {
    if (step.route) {
      navigate(step.route);
      onOpenChange(false);
    } else if (currentStep === 3 && referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied!");
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-primary/30">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-primary" : i < currentStep ? "w-3 bg-primary/40" : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>

          {/* Icon */}
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <step.icon className="h-8 w-8 text-primary" />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-display">{step.title}</h2>
            <p className="text-sm text-muted-foreground px-2">{step.subtitle}</p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-2 pt-2">
            <Button className="w-full volt-gradient font-semibold" onClick={handleAction}>
              {step.action}
            </Button>
            {currentStep < steps.length - 1 ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={handleNext}>
                  Next
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={handleSkip}>
                  Skip All
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleSkip}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
