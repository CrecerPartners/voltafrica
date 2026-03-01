import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Share2,
  Banknote,
  TrendingUp,
  Trophy,
  Users,
  ArrowRight,
  Zap,
} from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Sign Up", desc: "Create your free account and complete your campus ambassador profile." },
  { icon: Share2, title: "Share & Sell", desc: "Browse the marketplace, pick products you love, and share with your network." },
  { icon: Banknote, title: "Get Paid", desc: "Earn commissions on every confirmed sale. Request payouts anytime." },
];

const benefits = [
  { icon: TrendingUp, title: "Real Earnings", desc: "No MLM. No nonsense. Earn transparent, trackable commissions." },
  { icon: Trophy, title: "Climb Leaderboards", desc: "Compete with fellow ambassadors and unlock tier rewards." },
  { icon: Users, title: "Build Your Team", desc: "Refer friends, earn bonuses, and grow your own sales squad." },
];

export default function AboutStudents() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            For Students
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Your Campus. Your Hustle. Your Earnings.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Volt turns your campus influence into real income. Promote products, track your sales, and get paid — all from your phone.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl volt-gradient text-primary-foreground shadow-lg">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="mb-1 text-xs font-bold text-primary">Step {i + 1}</span>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <h2 className="mb-12 text-center font-display text-3xl font-bold">Why Join Volt?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border/60 bg-card/80 transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="volt-gradient">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Ready to Start Earning?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Sign up in under a minute and start sharing products today.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-background text-foreground px-8 font-semibold hover:bg-background/90"
          >
            <Link to="/login">
              Join Volt <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg volt-gradient">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            Volt
          </Link>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Volt Africa</p>
        </div>
      </footer>
    </div>
  );
}
