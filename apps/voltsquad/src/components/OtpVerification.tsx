import { useState, useEffect, useCallback } from "react";
import { Button } from "@digihire/shared";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@digihire/shared";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

interface OtpVerificationProps {
  email: string;
  onVerify: (token: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const OtpVerification = ({ email, onVerify, onResend, onBack, loading }: OtpVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleComplete = useCallback(
    async (value: string) => {
      if (value.length === 6) {
        await onVerify(value);
      }
    },
    [onVerify]
  );

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
      setCooldown(60);
      toast.success("New code sent to your email");
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleComplete} disabled={loading}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        onClick={() => handleComplete(otp)}
        className="w-full volt-gradient font-semibold"
        disabled={otp.length < 6 || loading}
      >
        {loading ? "Verifying..." : "Verify Email"}
      </Button>

      <div className="space-y-2">
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
        </button>
        <div>
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Use a different email
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;


