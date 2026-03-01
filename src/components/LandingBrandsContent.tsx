import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  Truck,
  MessageSquare,
  Rocket,
  ShieldCheck,
  RefreshCw,
  Eye,
  Handshake,
  Smartphone,
  Wifi,
  Banknote,
  Ticket,
  Shirt,
  BookOpen,
  ClipboardList,
  UserPlus,
  Radio,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const whyVolt = [
  {
    icon: Truck,
    title: "Zero-Stress Logistics",
    desc: "We handle recruitment, coordination, tracking, and weekly payouts to students.",
    extra: "You focus on your product. We focus on distribution and movement.",
  },
  {
    icon: Users,
    title: "Sales Density, Not Surface Reach",
    desc: "Volt deploys 100+ student sales agents per campus, ensuring saturation across hostels, classes, and departments — not one-off visibility from a few creators.",
  },
  {
    icon: MessageSquare,
    title: "Social-First Sales Content",
    desc: "Students buy on WhatsApp, Telegram & TikTok. Volt converts your product assets into high-conversion flyers, stickers, and status-ready content designed for campus sharing.",
  },
  {
    icon: Rocket,
    title: "Faster Time-to-Market",
    desc: "Campus campaigns can go live in days, not months.",
    extra: "Volt eliminates the long setup cycles of traditional field marketing and influencer campaigns.",
  },
  {
    icon: RefreshCw,
    title: "Repeat Buying & Community-Led Adoption",
    desc: "Campus communities are tight-knit. Once a product gains traction, repeat purchases and organic referrals follow, turning single campaigns into ongoing demand.",
  },
  {
    icon: ShieldCheck,
    title: "Vetted Campus Sales Force",
    desc: "Volt recruits and manages trusted students & student leaders — class governors, hostel reps, campus influencers who already influence real buying decisions.",
  },
  {
    icon: Handshake,
    title: "Direct Peer-to-Peer Trust & Selling",
    desc: "Students don't buy from ads; they buy from people they know. Volt leverages peer-to-peer recommendation, demos, and everyday conversations to drive faster adoption.",
  },
  {
    icon: Eye,
    title: "Performance Tracking, Not Guesswork",
    desc: "Track exactly which campuses, products, and student reps are driving sales — in real time.",
  },
];

const comparisonRows = [
  { label: "Reach", traditional: "Passive Scrolling", volt: "Direct Peer-to-Peer Trust" },
  { label: "Cost", traditional: "Pay-Per-Impression (High Risk)", volt: "Pay-Per-Sale (ROI Focused)" },
  { label: "Engagement", traditional: "One-off Clicks", volt: "Community-Led Adoption" },
  { label: "Tracking", traditional: "Vanity Metrics", volt: "Campus & Agent-Level Data" },
  { label: "Sales", traditional: "Uncertain", volt: "Performance Based" },
];

const verticals = [
  { icon: Smartphone, label: "Electronics & Gadgets" },
  { icon: Wifi, label: "Telco & Utility Services" },
  { icon: Banknote, label: "Fintech & Financial Services" },
  { icon: Ticket, label: "Events & Access" },
  { icon: Shirt, label: "Fashion & Lifestyle" },
  { icon: BookOpen, label: "Academic & Professional Tools" },
];

const processSteps = [
  { icon: ClipboardList, title: "List Your Brand", desc: "Submit your product and campaign details through our onboarding form." },
  { icon: UserPlus, title: "Campaign Activation", desc: "We recruit and assign student sales agents and campus ambassadors based on your target schools." },
  { icon: Radio, title: "Campus Sales Go Live", desc: "Your campaign launches across selected campuses with WhatsApp-first content and referral tracking." },
  { icon: TrendingUp, title: "Track Sales & Scale", desc: "Monitor performance by campus and agent. Scale into more schools as demand grows." },
];

export function LandingBrandsContent() {
  const [activeVertical, setActiveVertical] = useState(0);

  return (
    <>
      {/* Why Brands Choose Volt */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Why Brands Choose Volt</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {whyVolt.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-card/80 p-6 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              {item.extra && (
                <p className="mt-2 text-sm font-medium text-foreground/80">{item.extra}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* The Volt Advantage */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
          <h2 className="mb-10 text-center font-display text-3xl font-bold md:text-4xl">
            The Volt Advantage
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-3 bg-muted/60 text-sm font-semibold">
              <div className="p-4" />
              <div className="p-4 text-center text-muted-foreground">Traditional Ads</div>
              <div className="p-4 text-center text-primary">The Volt Way</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-card/80" : "bg-muted/20"}`}
              >
                <div className="p-4 font-semibold">{row.label}</div>
                <div className="flex items-center justify-center gap-1.5 p-4 text-center text-muted-foreground">
                  <XCircle className="hidden h-3.5 w-3.5 shrink-0 text-destructive sm:inline" />
                  <span>{row.traditional}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-4 text-center font-medium text-foreground">
                  <CheckCircle2 className="hidden h-3.5 w-3.5 shrink-0 text-primary sm:inline" />
                  <span>{row.volt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Verticals */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="mb-4 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Product Verticals We Distribute</h2>
          <p className="mt-3 text-muted-foreground">
            Volt focuses on fast-moving, high-demand products that students already buy.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {verticals.map((v, i) => (
            <button
              key={v.label}
              onClick={() => setActiveVertical(i)}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                activeVertical === i
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/60 bg-card/80 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <v.icon className="h-6 w-6" />
              <span className="text-xs font-semibold leading-tight">{v.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* The Volt Process */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">
            The Volt Process
          </h2>
          <div className="relative space-y-0">
            {processSteps.map((step, i) => (
              <div key={step.title} className="relative flex gap-5 pb-10 last:pb-0">
                {i < processSteps.length - 1 && (
                  <div className="absolute left-5 top-12 h-full w-px bg-border" />
                )}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full volt-gradient text-primary-foreground font-bold text-sm shadow-md">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="volt-gradient">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Distribution for the Next Generation
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Students don't buy from ads — they buy from people they trust. Volt turns campuses into structured sales environments powered by peer influence and real incentives.
          </p>
          <p className="mt-3 text-sm font-semibold text-primary-foreground/90 italic">
            This is not influencer marketing. This is campus distribution infrastructure.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-background text-foreground px-8 font-semibold hover:bg-background/90"
          >
            <Link to="/login?mode=signup&role=brand">
              Partner with Volt <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
