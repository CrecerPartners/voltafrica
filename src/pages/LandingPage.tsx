import { useState, useRef, useEffect } from "react";
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
  CheckCircle2,
} from "lucide-react";

import heroStudent from "@/assets/hero-student.png";
import heroBrands from "@/assets/hero-brands.png";

const audiences = {
  students: {
    badge: "For Gen Z Sellers",
    headline: "Join 1,000+ Gen Z Sellers Earning on Volt",
    subtitle:
      "Use your influence, audience, and network to promote products you love and earn real commissions while connecting with your community.",
    cta: "Start Earning Today",
    ctaLink: "/join-now",
    icon: GraduationCap,
    image: heroStudent,
  },
  brands: {
    badge: "For Brands",
    headline: "Built for Brands Selling to Gen Z & Millennials",
    subtitle:
      "Fintech · Fashion · Food · Apps · Subscriptions · Events",
    cta: "Partner with Volt",
    ctaLink: "https://volt.crecerpartners.com/brand-form/",
    icon: Building2,
    image: heroBrands,
  },
};

const sellerTypes = [
  "Students",
  "NYSC members",
  "Fresh grads",
  "Micro-influencers",
  "Content creators",
  "Young urban youth sellers",
];

const whyJoin = [
  { icon: Star, title: "Reliable Weekly Payouts", desc: "Earn consistently. Get paid every week." },
  { icon: GraduationCap, title: "Career Advantage", desc: "Build real sales, marketing, and audience growth skills while earning." },
  { icon: BookOpen, title: "Free Training", desc: "Access practical training to help you sell smarter and scale faster." },
  { icon: ShoppingBag, title: "Curated Marketplace", desc: "Browse and sell from high-demand trending products Gen Z already love." },
  { icon: Users, title: "Refer & Earn", desc: "Build your network and earn commission on their sales." },
  { icon: BarChart3, title: "Track Everything", desc: "Real-time dashboard for sales, earnings, and performance growth." },
];

const stats = [
  { value: 20, suffix: "+", label: "Locations Covered" },
  { value: 5, suffix: "K+", label: "Gen Z Sellers" },
  { value: 500, prefix: "₦", suffix: "K+", label: "Paid Out" },
  { value: 100, suffix: "+", label: "Brands & Products" },
];

const earnings = [
  { title: "Signup Bonus", desc: "Receive ₦500 when you activate your seller account." },
  { title: "Direct Sales Commission", desc: "Earn up to 30% on every product you sell." },
  { title: "Referral Commission", desc: "Earn ₦1,000 for every seller you bring who activates and completes 5 sales." },
  { title: "Performance Bonus", desc: "Unlock extra cash rewards when you hit weekly sales targets." },
  { title: "Leadership Earnings", desc: "Top-performing sellers can qualify for monthly leadership payouts." },
];

function CountUpStat({ value, prefix, suffix, label }: { value: number; prefix?: string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const duration = 2000;
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-3xl font-bold text-primary md:text-4xl">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

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
              Sellers
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
                <Link to={tab === "students" ? "/about/sellers" : "/about/brands"}>
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
          {/* Stats with count-up */}
          <section className="border-y border-border bg-muted/30">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-12 md:grid-cols-4 md:py-16">
              {stats.map((s) => (
                <CountUpStat key={s.label} value={s.value} prefix={s.prefix} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </section>

          {/* Who can sell */}
          <section className="border-b border-border bg-muted/30">
            <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold md:text-3xl">Who Can Sell on Volt?</h2>
                <p className="mt-2 text-muted-foreground">Join 1K+ Gen Z Sellers Across Nigeria</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {sellerTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Earnings */}
          <section className="border-b border-border bg-muted/30">
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
                  <Link to="/join-now">Become a Volt Seller<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Why Join */}
          <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Why Join the VoltSquad?</h2>
              <p className="mt-3 text-muted-foreground">Everything you need to start earning.</p>
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

          {/* Categories */}
          <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-[250px] w-[250px] rounded-full bg-primary/5 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
              <div className="mb-12 text-center">
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Categories</span>
                <h2 className="font-display text-3xl font-bold md:text-4xl">Find Your Niche</h2>
                <p className="mt-3 text-muted-foreground">Pick a category and start selling what you love.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Smartphone, title: "Gadgets", examples: ["Power banks", "Bluetooth devices", "Fast chargers", "AirPods"], gradient: "from-blue-500/20 to-cyan-500/20" },
                  { icon: Wifi, title: "Telco Services", examples: ["Discounted data bundles", "Airtime deals"], gradient: "from-green-500/20 to-emerald-500/20" },
                  { icon: Landmark, title: "Banking & Fintech", examples: ["App signups", "Account referrals", "Fintech tools"], gradient: "from-amber-500/20 to-orange-500/20" },
                  { icon: Ticket, title: "Events", examples: ["Concert tickets", "Party passes", "Career fair registration", "Cinema tickets"], gradient: "from-purple-500/20 to-pink-500/20" },
                  { icon: Shirt, title: "Fashion & Lifestyle", examples: ["Hoodies", "Tote bags", "Shoes", "Skincare essentials"], gradient: "from-rose-500/20 to-red-500/20" },
                  { icon: BookOpen, title: "Courses", examples: ["Tech courses", "Fashion courses", "Skill-building programs"], gradient: "from-indigo-500/20 to-violet-500/20" },
                ].map((cat) => (
                  <div key={cat.title} className="group relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                    <div className="relative">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl volt-gradient shadow-lg">
                        <cat.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h3 className="font-display text-lg font-bold mb-3">{cat.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {cat.examples.map((ex) => (
                          <span key={ex} className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
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
              Ready to Start Earning?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Whether you're a Gen Z seller, creator, or brand, Volt helps you monetize influence and scale fast.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground px-8 text-base font-semibold hover:bg-background/90"
              >
                <Link to="/join-now">Join the VoltSquad</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 md:flex-row md:justify-between">
          <div className="flex items-center">
            <img src="/Volt1.png" alt="Volt Logo" className="h-7 w-auto object-contain" />
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
