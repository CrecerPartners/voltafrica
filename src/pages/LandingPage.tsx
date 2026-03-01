import { useState } from "react";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingBrandsContent } from "@/components/LandingBrandsContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Gift,
  DollarSign,
  Flame,
  Target,
  Crown,
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
  { icon: TrendingUp, title: "Earn Commissions", desc: "Get paid for every sale you make — tracked in real time.", screenshot: "/screenshots/sales.png" },
  { icon: ShoppingBag, title: "Curated Marketplace", desc: "Browse products students actually want, from top brands.", screenshot: "/screenshots/marketplace.png" },
  { icon: BarChart3, title: "Track Everything", desc: "Dashboard with sales analytics, earnings, and growth metrics.", screenshot: "/screenshots/dashboard.png" },
  { icon: Trophy, title: "Leaderboards", desc: "Compete with peers, climb the ranks, unlock rewards.", screenshot: "/screenshots/dashboard2.png" },
  { icon: Users, title: "Refer & Earn", desc: "Invite friends and earn bonus commissions on their sales.", screenshot: "/screenshots/dashboard.png" },
  { icon: Star, title: "Tier Rewards", desc: "Level up from Bronze to Diamond with exclusive perks.", screenshot: "/screenshots/wallet.png" },
];

const rewards = [
  { icon: Gift, title: "Signup Bonus", desc: "₦500 Credit to your Volt account the moment you register." },
  { icon: DollarSign, title: "Direct Sales Commission", desc: "Up to 30% per product sold." },
  { icon: Flame, title: "Referral Bonus", desc: '₦1,000 "Spark Bonus" for every friend you bring who makes their first 5 sales.' },
  { icon: Target, title: "High-Volume Bonus", desc: "Extra Cash for Influencers who hit weekly targets." },
  { icon: Crown, title: "Lead Base Pay", desc: "₦5,000 – ₦30,000 monthly (Team Leads only)." },
];

const studentStats = [
  { value: "500+", label: "Campuses" },
  { value: "10,000+", label: "Ambassadors" },
  { value: "₦50M+", label: "Commissions Paid" },
  { value: "200+", label: "Brand Partners" },
];

const brandStats = [
  { value: "2M", label: "Active Student Buyers" },
  { value: "60k", label: "Students per Campus" },
  { value: "100+", label: "Agents per Campus" },
  { value: "7 Days", label: "To Launch Sales" },
];

export default function LandingPage() {
  const [tab, setTab] = useState<"students" | "brands">("students");
  const isMobile = useIsMobile();
  const active = audiences[tab];
  const Icon = active.icon;

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center md:pb-28 md:pt-24">
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
          {(tab === "brands" ? brandStats : studentStats).map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {tab === "brands" ? (
        <LandingBrandsContent />
      ) : (
        <>
          {/* Student Hero Images */}
          <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-border/40 shadow-xl">
                <img
                  src="/images/hero-student-2.png"
                  alt="Join Volt Squad — Earn while in school"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-border/40 shadow-xl">
                <img
                  src="/images/hero-student-1.png"
                  alt="Get ready to earn more while in school"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:pb-24 md:pt-8">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Start Earning with Volt</h2>
              <p className="mt-3 text-muted-foreground">
                Powerful tools to help you sell, track, and grow — all in one place.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const cardContent = (
                  <Card className="group h-full cursor-pointer border-border/60 bg-card/80 transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="flex h-full flex-col gap-3 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:volt-gradient group-hover:text-primary-foreground">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                );

                if (isMobile) {
                  return <div key={f.title}>{cardContent}</div>;
                }

                return (
                  <HoverCard key={f.title} openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>{cardContent}</HoverCardTrigger>
                    <HoverCardContent className="w-52 p-1.5 shadow-lg" side="top" sideOffset={8}>
                      <div className="overflow-hidden rounded-lg border border-border">
                        <img
                          src={f.screenshot}
                          alt={`${f.title} preview`}
                          className="h-80 w-full object-cover"
                          style={{ objectPosition: "0 -30px" }}
                        />
                      </div>
                      <p className="mt-1.5 text-center text-xs font-medium text-muted-foreground">{f.title}</p>
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
          </section>

          {/* How to Earn with Volt */}
          <section className="border-y border-border bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
              <div className="mb-12 text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl">How to Earn with Volt</h2>
                <p className="mt-3 text-muted-foreground">
                  Multiple ways to earn — pick what works for you.
                </p>
              </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                {rewards.map((r, i) => (
                  <div
                    key={r.title}
                    className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold">{r.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-lg font-semibold text-foreground">Find Your Niche</p>
                <Button
                  asChild
                  size="lg"
                  className="volt-gradient border-0 px-8 text-base font-semibold shadow-xl hover:opacity-90"
                >
                  <Link to="/login?mode=signup">
                    Sign Up & Claim My ₦500 Bonus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
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
        </>
      )}

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
            <Link to="/about/students" className="hover:text-foreground transition-colors">For Students</Link>
            <Link to="/about/brands" className="hover:text-foreground transition-colors">For Brands</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Volt Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
