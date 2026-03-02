import { useState } from "react";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  TrendingUp,
  Users,
  Trophy,
  ShoppingBag,
  BarChart3,
  GraduationCap,
  Building2,
  ArrowRight,
  Star,
} from "lucide-react";

const audiences = {
  students: {
    badge: "For Students",
    headline: "Join the Volt Squad",
    subtitle:
      "Become a campus ambassador, promote products you love, and earn real commissions — all while you study.",
    cta: "Start Earning Today",
    ctaLink: "/login?mode=signup&role=student",
    icon: GraduationCap,
  },
  brands: {
    badge: "For Brands",
    headline: "Start Selling on Campus",
    subtitle:
      "Reach thousands of students through trusted campus ambassadors. Launch hyper-local campaigns that actually convert.",
    cta: "Partner with Volt",
    ctaLink: "/login?mode=signup&role=brand",
    icon: Building2,
  },
};

const features = [
  { icon: TrendingUp, title: "Earn Commissions", desc: "Get paid for every sale you make — tracked in real time." },
  { icon: ShoppingBag, title: "Curated Marketplace", desc: "Browse products students actually want, from top brands." },
  { icon: BarChart3, title: "Track Everything", desc: "Dashboard with sales analytics, earnings, and growth metrics." },
  { icon: Trophy, title: "Leaderboards", desc: "Compete with peers, climb the ranks, unlock rewards." },
  { icon: Users, title: "Refer & Earn", desc: "Invite friends and earn bonus commissions on their sales." },
  { icon: Star, title: "Tier Rewards", desc: "Level up from Bronze to Diamond with exclusive perks." },
];

const stats = [
  { value: "500+", label: "Campuses" },
  { value: "10,000+", label: "Ambassadors" },
  { value: "₦50M+", label: "Commissions Paid" },
  { value: "200+", label: "Brand Partners" },
];

export default function LandingPage() {
  const [tab, setTab] = useState<"students" | "brands">("students");
  const active = audiences[tab];
  const Icon = active.icon;

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center md:pb-28 md:pt-24">
          {/* Toggle pill */}
          <div className="mx-auto mb-10 inline-flex rounded-full border border-border bg-muted/60 p-1 backdrop-blur-sm">
            <button
              onClick={() => setTab("students")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                tab === "students"
                  ? "volt-gradient text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setTab("brands")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                tab === "brands"
                  ? "volt-gradient text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Brands
            </button>
          </div>

          {/* Animated content */}
          <div key={tab} className="animate-fade-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl volt-gradient shadow-lg">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>

            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {active.badge}
            </span>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              {active.headline}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {active.subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="volt-gradient border-0 px-8 text-base font-semibold shadow-xl hover:opacity-90"
              >
                <Link to={active.ctaLink}>
                  {active.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 text-base">
                <Link to={tab === "students" ? "/about/students" : "/about/brands"}>
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:py-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Everything You Need to Succeed</h2>
          <p className="mt-3 text-muted-foreground">
            Powerful tools for ambassadors and brands alike.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group border-border/60 bg-card/80 transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:volt-gradient group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="volt-gradient">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Whether you're a student looking to earn or a brand looking to grow — Volt is your launchpad.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground px-8 text-base font-semibold hover:bg-background/90"
            >
              <Link to="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg volt-gradient">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            Volt
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Volt Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
