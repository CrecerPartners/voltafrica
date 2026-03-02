import { useState } from "react";
import { Link } from "react-router-dom";
import { LandingNavbar } from "@/components/LandingNavbar";
import { BrandsContent } from "@/components/landing/BrandsContent";
import { Button } from "@/components/ui/button";
import {
  Zap,
  TrendingUp,
  Users,
  
  ShoppingBag,
  BarChart3,
  GraduationCap,
  Building2,
  ArrowRight,
  Star,
  BookOpen,
  Smartphone,
  Wifi,
  Landmark,
  Ticket,
  Shirt,
} from "lucide-react";

import heroStudent from "@/assets/hero-student.png";
import heroBrands from "@/assets/hero-brands.png";

const audiences = {
  students: {
    badge: "For Students",
    headline: "Join the Volt Squad",
    subtitle:
      "Become a campus ambassador, promote products you love, and earn real commissions — all while you study.",
    cta: "Start Earning Today",
    ctaLink: "/login?mode=signup&role=student",
    icon: GraduationCap,
    image: heroStudent,
  },
  brands: {
    badge: "For Brands",
    headline: "Start Selling on Campus",
    subtitle:
      "Reach thousands of students through trusted campus ambassadors. Launch hyper-local campaigns that actually convert.",
    cta: "Partner with Volt",
    ctaLink: "https://volt.crecerpartners.com/brand-form/",
    icon: Building2,
    image: heroBrands,
  },
};

const whyJoin = [
  { icon: Zap, title: "Zero Startup Capital", desc: "Start selling immediately — no investment needed." },
  { icon: ShoppingBag, title: "Vetted Products", desc: "Only quality, in-demand products from trusted brands." },
  { icon: TrendingUp, title: "High Commissions", desc: "Earn competitive rates on every sale you close." },
  { icon: Star, title: "Weekly Payouts", desc: "Get paid every Friday — straight to your bank." },
  { icon: GraduationCap, title: "Career Advantage", desc: "Build real sales and marketing skills while in school." },
  { icon: BookOpen, title: "Free Training", desc: "Access courses and resources to sharpen your skills." },
  { icon: ShoppingBag, title: "Curated Marketplace", desc: "Browse and pick products students actually want." },
  { icon: Users, title: "Refer & Earn", desc: "Invite friends and earn bonus commissions on their sales." },
  { icon: BarChart3, title: "Track Everything", desc: "Dashboard with sales analytics, earnings, and growth." },
];

const stats = [
  { value: "100+", label: "Campuses" },
  { value: "5,000+", label: "Sales Agents" },
  { value: "₦500K+", label: "Commissions Paid" },
  { value: "50+", label: "Products Listed" },
];

const earnings = [
  { title: "Signup Bonus", desc: "₦500 Credit to your Volt account the moment you register." },
  { title: "Direct Sales Commission", desc: "Up to 30%" },
  { title: "Referral Bonus", desc: "₦1,000 \"Spark Bonus\" for every friend you bring who makes their first 5 sales." },
  { title: "High-Volume Bonus", desc: "Extra Cash for Influencers who hit weekly targets." },
  { title: "Lead Base Pay", desc: "₦5,000 – ₦30,000 monthly (Team Leads only)." },
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
                {active.ctaLink.startsWith("http") ? (
                  <a href={active.ctaLink} target="_blank" rel="noopener noreferrer">
                    {active.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <Link to={active.ctaLink}>
                    {active.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 text-base">
                <Link to={tab === "students" ? "/about/students" : "/about/brands"}>
                  Learn More
                </Link>
              </Button>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-border max-w-3xl mx-auto">
              <img src={active.image} alt={active.badge} className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {tab === "students" && (
        <>
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
          <section className="border-y border-border bg-muted/30">
            <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
              <div className="mb-12 text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl">Multiple Ways to Earn on Volt</h2>
                <p className="mt-3 text-muted-foreground">Start earning from day one — here's how.</p>
              </div>
              <div className="flex flex-col gap-4">
                {earnings.map((item, i) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg volt-gradient text-sm font-bold text-primary-foreground">{i + 1}</div>
                    <div>
                      <h3 className="font-display text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button asChild size="lg" className="volt-gradient border-0 px-8 text-base font-semibold shadow-xl hover:opacity-90">
                  <Link to="/login?mode=signup">Sign Up & Claim My ₦500 Bonus<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </section>
          <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Why Join the Volt Squad?</h2>
              <p className="mt-3 text-muted-foreground">Everything you need to start earning on campus.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {whyJoin.map((f) => (
                <div key={f.title} className="group flex items-start gap-4 rounded-xl border border-border/60 bg-card/80 p-5 transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:volt-gradient group-hover:text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Find Your Niche */}
          <section className="border-y border-border bg-muted/30">
            <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
              <div className="mb-10 text-center">
                <h2 className="font-display text-3xl font-bold md:text-4xl">Find Your Niche</h2>
                <p className="mt-3 text-muted-foreground">Pick a category and start selling what you love.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Smartphone, title: "Gadgets", examples: "Power banks, Bluetooth devices, fast chargers, AirPods" },
                  { icon: Wifi, title: "Telco Services", examples: "Discounted data bundles, airtime deals" },
                  { icon: Landmark, title: "Banking & Fintech", examples: "App signups, account referrals, fintech tools" },
                  { icon: Ticket, title: "Events", examples: "Concert tickets, party passes, career fair registration, cinema tickets" },
                  { icon: Shirt, title: "Fashion & Lifestyle", examples: "Hoodies, tote bags, tops, shoes, skincare essentials" },
                  { icon: BookOpen, title: "Courses", examples: "Tech courses, fashion courses, skill-building programs" },
                ].map((cat) => (
                  <div key={cat.title} className="group rounded-xl border border-border/60 bg-card/80 p-5 transition-all hover:border-primary/30 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:volt-gradient group-hover:text-primary-foreground">
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-lg font-semibold">{cat.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cat.examples}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {tab === "brands" && <BrandsContent />}


      {tab === "students" && (
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
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Volt Africa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
