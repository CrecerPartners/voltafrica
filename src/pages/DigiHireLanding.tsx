import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Settings2, MapPin, CheckCircle2 } from "lucide-react";
import GradientBarsBackground from "@/components/ui/gradient-bars-background";

// ── Brand tokens ──────────────────────────────────────
const CYAN = "rgb(0, 194, 255)";
const NAVY = "rgb(6, 17, 31)";

// ── Data ──────────────────────────────────────────────
const talentProfiles = [
  { initials: "IM", name: "Ibifaa Maclayton",  role: "Commercial Lead",      flag: "🇳🇬" },
  { initials: "FO", name: "Folu Otubanjo",      role: "Industry Lead",        flag: "🇳🇬" },
  { initials: "OA", name: "Oluwasegun Alex",    role: "Sales Expert · Ex-MTN",flag: "🇳🇬" },
  { initials: "GU", name: "Gertrude Umeh",      role: "Business Development", flag: "🇳🇬" },
];

const heroContent = {
  jobs: {
    headline: "Advance Your Career with Professional Growth Tools",
    sub: "DigiHire helps working professionals optimize their CVs, build resumes, access hidden job opportunities, and connect with top recruiters.",
    cta: "Try DigiHire for Free",
  },
  hire: {
    headline: "Hire Verified Tech Sales Talent Across Africa",
    sub: "Cut costs, hire quickly, and take the stress out of talent search. DigiHire's pre-vetted talent pool is curated to help your company grow.",
    cta: "Find Talent Now →",
  },
};

const features = [
  { icon: "📝", title: "Professional Resume Reviews",   desc: "Expert feedback from industry professionals. Unlimited CV reviews optimized for ATS systems." },
  { icon: "🤖", title: "AI-Powered Resume Building",    desc: "Create standout resumes with AI assistance, tailored to your target roles automatically." },
  { icon: "💼", title: "Premium Job Access",            desc: "Exclusive, hand-picked opportunities with priority consideration from top employers across Africa." },
  { icon: "🔗", title: "LinkedIn Profile Optimization", desc: "Comprehensive analysis and optimization to increase your visibility and recruiter attraction." },
];

const stats = [
  { value: 10000, display: "10K+",  label: "Professionals on platform" },
  { value: 87,    display: "87%",   label: "Career Advancement Rate" },
  { value: 150,   display: "150+",  label: "Partner Companies" },
  { value: 20,    display: "20+",   label: "Countries Covered" },
];

const platformCards = [
  { tag: "Autofarm",  title: "Expert talent management.",      desc: "Focus on your business while we handle hiring and talent management end-to-end.",           color: "from-cyan-500/10 to-sky-500/5" },
  { tag: "Metrics",   title: "Career advancement platform.",   desc: "Professional reviews, resume building, and job access — tracked with real-time metrics.", color: "from-emerald-500/10 to-teal-500/5" },
  { tag: "DigiHire",  title: "Hire verified talent.",          desc: "Background, criminal, and education checks validated by our in-house verification team.",   color: "from-cyan-500/10 to-blue-500/5" },
];

const hiringSteps = [
  "Find Talent",
  "Soft Skills & English Evaluation",
  "Technical Assessment",
  "Final Interviews",
  "Hiring Process & Onboarding",
];

const blogPosts = [
  { cat: "Career Growth",    emoji: "📈", title: "How to Break Into Tech Sales with Zero Experience",              desc: "A practical guide to landing your first tech sales role in Africa's booming tech sector." },
  { cat: "Hiring Strategy",  emoji: "🤝", title: "Why African Companies Are Winning with Remote-First Hiring",    desc: "How forward-thinking companies access top talent pools across the continent." },
  { cat: "Platform Update",  emoji: "🎯", title: "DigiHire Launches Advanced AI Resume Optimization",             desc: "Our AI-powered resume builder helps professionals get past ATS filters and land interviews." },
];

// ── Animated count-up hook ─────────────────────────────
function useCountUp(target: number, trigger: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return count;
}

function StatItem({ display, label, trigger }: { display: string; label: string; trigger: boolean }) {
  const num = parseInt(display.replace(/\D/g, ""));
  const suffix = display.replace(/[0-9]/g, "");
  const count = useCountUp(num, trigger);
  return (
    <div className="text-center py-8 px-6">
      <p className="font-display text-4xl font-extrabold text-[#00C2FF] leading-none mb-1 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
        {count}{suffix}
      </p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

// ── Component ──────────────────────────────────────────
export default function DigiHireLanding() {
  const [tab, setTab] = useState<"jobs" | "hire">("hire");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [statsTrigger, setStatsTrigger] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const content = heroContent[tab];

  // Trigger count-up when stats section enters viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsTrigger(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .hero-tab-active { background: #ffffff; color: #06111F; font-weight: 700; }
        .hero-tab-inactive { color: rgba(255,255,255,0.72); }
        .hero-tab-inactive:hover { color: #ffffff; }
        .btn-launch:hover { background: #33CFFF; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(0,194,255,0.5); }
        .talent-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.15); }
        .feat-card:hover { border-color: rgba(0,194,255,0.25); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.07); }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.08); border-color: rgba(0,194,255,0.2); }
        .psc:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.08); }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-track { display: flex; width: max-content; animation: marquee 22s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════ */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-[68px] w-full px-10">
          {/* LEFT: Logo + nav links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/digihire" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-[38px] h-[38px] rounded-full bg-[#06111F] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 18 18" className="w-5 h-5 fill-[#00C2FF]">
                  <path d="M2 9C2 5.13 5.13 2 9 2s7 3.13 7 7-3.13 7-7 7S2 12.87 2 9zm7-4L6 9h3l-1 4 5-6h-3l1-2z"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-[18px] text-[#06111F] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Digi<span className="text-[#00C2FF]">Hire</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">...global access to verified talent</span>
              </div>
            </Link>

            {/* Nav links flush beside logo */}
            <ul className="hidden md:flex items-center gap-1 list-none">
              {["Why DigiHire?", "Brands", "For Talents"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[14px] text-slate-600 font-medium px-3.5 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: Get Started dropdown + Launch CTA */}
          <div className="flex items-center gap-3">
            {/* Get Started dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                className="flex items-center gap-1.5 text-[14px] font-bold text-slate-800 border border-slate-200 rounded-lg px-4 py-2.5 hover:border-slate-300 hover:bg-slate-50 transition-all"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Get Started
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 w-52 z-50"
                  onClick={(e) => e.stopPropagation()}>
                  {[
                    { icon: "🎯", label: "I'm Looking for a Job" },
                    { icon: "🏢", label: "I'm Hiring Talent" },
                    { icon: "🚀", label: "Explore Platform" },
                  ].map((item, i) => (
                    <div key={item.label}>
                      {i === 2 && <div className="h-px bg-slate-100 my-1.5" />}
                      <Link to={i === 0 ? "/login?role=talent" : i === 1 ? "/login?role=brand" : "/"} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-[14px] text-slate-700 font-medium transition-colors">
                        <span className="w-7 h-7 rounded-md bg-cyan-50 border border-cyan-100 flex items-center justify-center text-sm flex-shrink-0">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main CTA */}
            <Link
              to="/login?role=brand"
              className="btn-launch flex items-center gap-2 text-[14px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-lg px-5 py-2.5 transition-all duration-200"
              style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 3px 16px rgba(0,194,255,0.35)" }}
            >
              Launch a Campaign
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO (Gradient Bars Background) ════════════ */}
      <div className="mx-4">
        <GradientBarsBackground
          numBars={18}
          gradientFrom="rgba(0, 194, 255, 0.55)"
          gradientTo="transparent"
          animationDuration={2.5}
          backgroundColor={NAVY}
          overlay="linear-gradient(180deg, rgba(6,17,31,0.65) 0%, rgba(6,17,31,0.50) 50%, rgba(6,17,31,0.75) 100%)"
          className="min-h-[580px] rounded-b-2xl"
        >
          <div className="flex flex-col items-center text-center px-6 py-20 w-full">
            {/* Audience toggle */}
            <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1 mb-10 gap-0.5">
              <button
                onClick={() => setTab("jobs")}
                className={`px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-250 ${tab === "jobs" ? "hero-tab-active" : "hero-tab-inactive"}`}
              >
                I'm Looking for Jobs
              </button>
              <button
                onClick={() => setTab("hire")}
                className={`px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-250 ${tab === "hire" ? "hero-tab-active" : "hero-tab-inactive"}`}
              >
                I'm Hiring Talent
              </button>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-extrabold text-white leading-[1.07] tracking-tight mb-5 max-w-[780px]"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(34px, 5.5vw, 62px)", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
            >
              {content.headline}
            </h1>

            {/* Subtitle */}
            <p className="text-white/75 max-w-[520px] mb-10 leading-relaxed" style={{ fontSize: "clamp(15px, 1.8vw, 17px)" }}>
              {content.sub}
            </p>

            {/* Single CTA */}
            <Link
              to={tab === "jobs" ? "/join-now?role=talent" : "/join-now?role=brand"}
              className="btn-launch inline-flex items-center justify-center gap-2 font-extrabold text-[#06111F] bg-[#00C2FF] rounded-xl px-12 py-4 text-[16px] transition-all duration-200"
              style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 6px 32px rgba(0,194,255,0.45)" }}
            >
              {content.cta}
            </Link>
          </div>
        </GradientBarsBackground>
      </div>

      {/* ══ LOGOS STRIP ════════════════════════════════ */}
      <div className="py-6 px-4">
        <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-2xl py-8">
          <p className="text-center text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-6 px-7">
            Leading companies worldwide trust DigiHire to source the best talent across Africa
          </p>
          <div className="overflow-hidden px-7">
            <div className="marquee-track">
              {[...["Big Cabal", "Paystack", "Dangote", "RSN Media", "Phase3", "PayU", "Flutterwave"], ...["Big Cabal", "Paystack", "Dangote", "RSN Media", "Phase3", "PayU", "Flutterwave"]].map((name, i) => (
                <span key={i} className="font-display font-extrabold text-[17px] text-slate-300 hover:text-slate-500 transition-colors cursor-default tracking-tight px-8" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ TALENT PROFILES ════════════════════════════ */}
      <section className="bg-white py-20" id="talent">
        <div className="max-w-5xl mx-auto px-7">
          <h2 className="font-display font-extrabold text-center text-[#06111F] mb-12 tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 3.5vw, 36px)" }}>
            Ready to Unlock Verified Top African Talent?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {talentProfiles.map((p) => (
              <div key={p.initials} className="talent-card rounded-2xl overflow-hidden bg-[#0F2544] transition-all duration-300 cursor-pointer" style={{ aspectRatio: "3/4" }}>
                {/* Avatar placeholder */}
                <div className="w-full h-full relative flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    <span className="font-display font-extrabold text-5xl text-[#00C2FF]" style={{ fontFamily: "'Syne', sans-serif" }}>{p.initials}</span>
                  </div>
                  <div className="p-4" style={{ background: "linear-gradient(0deg, rgba(6,17,31,0.95) 0%, transparent)" }}>
                    <div className="flex items-center gap-1.5 font-bold text-[13px] text-white mb-0.5">
                      {p.name} <span className="text-base">{p.flag}</span>
                    </div>
                    <p className="text-[11px] text-white/60 mb-2">{p.role}</p>
                    <span className="inline-flex items-center gap-1 bg-[#00C2FF] text-[#06111F] text-[10px] font-extrabold px-2 py-0.5 rounded" style={{ fontFamily: "'Syne', sans-serif" }}>
                      ✓ Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES + STATS ═══════════════════════════ */}
      <section className="bg-slate-50 py-20" id="features">
        <div className="max-w-5xl mx-auto px-7">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-[#00C2FF] mb-3">Ready for Your Next Role?</p>
              <h2 className="font-display font-extrabold text-[#06111F] leading-tight mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 3.5vw, 34px)" }}>
                Join thousands of professionals who've advanced their careers.
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
                DigiHire's comprehensive career advancement platform connects you to verified opportunities across Africa and beyond.
              </p>
              <div className="flex flex-col gap-6 mb-8">
                {features.map((f) => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-xl flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[15px] text-slate-800 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</p>
                      <p className="text-[13px] text-slate-500 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/join-now?role=talent" className="btn-launch inline-flex items-center gap-2 text-[14px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-lg px-6 py-3 transition-all duration-200" style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 3px 16px rgba(0,194,255,0.3)" }}>
                  Start Your Journey →
                </Link>
                <a href="#" className="inline-flex items-center gap-2 text-[14px] font-bold text-slate-700 border border-slate-200 rounded-lg px-6 py-3 hover:border-slate-300 hover:bg-slate-50 transition-all" style={{ fontFamily: "'Syne', sans-serif" }}>
                  View Plans & Pricing
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">
              {/* Stats */}
              <div ref={statsRef} className="bg-[#06111F] rounded-2xl grid grid-cols-2 divide-x divide-y divide-white/5">
                {stats.map((s) => (
                  <StatItem key={s.label} display={s.display} label={s.label} trigger={statsTrigger} />
                ))}
              </div>
              {/* Testimonial */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6">
                <p className="text-amber-400 tracking-widest text-sm mb-3">★★★★★</p>
                <p className="text-[14px] text-slate-600 italic leading-relaxed mb-4">
                  "The professional resume review helped me identify exactly what employers were looking for, and I landed my dream role within 4 weeks."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F2544] flex items-center justify-center text-[13px] font-extrabold text-[#00C2FF]" style={{ fontFamily: "'Syne', sans-serif" }}>AO</div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">Adewale Olubunmi</p>
                    <p className="text-[12px] text-slate-400">SDR, Stripe · Lagos</p>
                  </div>
                </div>
              </div>
              {/* Value badge */}
              <div className="bg-[#00C2FF] rounded-2xl p-6">
                <p className="font-extrabold text-[17px] text-[#06111F] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Incredible Value</p>
                <p className="text-[14px] text-[#06111F]/75 leading-relaxed">
                  Our Prime Plus plan has helped members save over ₦840,000 in professional career service costs — that's over 3,900 savings on career advancement tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM ═══════════════════════════════════ */}
      <section className="bg-white py-20" id="platform">
        <div className="max-w-5xl mx-auto px-7">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#00C2FF] mb-3">All-in-one Platform</p>
            <h2 className="font-display font-extrabold text-[#06111F] tracking-tight mb-3" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 3.5vw, 36px)" }}>
              Discover talent with our all-in-one hiring platform
            </h2>
            <p className="text-[15px] text-slate-500 max-w-xl mx-auto leading-relaxed">
              Cut costs, hire quickly, and take the stress out of talent search. DigiHire's verified talent pool is curated to help your company grow.
            </p>
          </div>

          {/* Hero card */}
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-cyan-100 rounded-3xl overflow-hidden grid md:grid-cols-2 mb-5">
            <div className="p-12 flex flex-col justify-center">
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#0096C7] mb-3">DigiHire Core</p>
              <h3 className="font-display font-extrabold text-[#06111F] leading-tight mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 3vw, 34px)" }}>
                Talent you need,<br />whenever you need it.
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                DigiHire helps you find top talent even when they're off the market. Hire the best for your team with our comprehensive talent management suite.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#0F2544] to-[#1D3A64] flex items-center justify-center p-10 min-h-[240px] relative">
              <div className="flex flex-col items-center gap-4">
                <div className="flex">
                  {["IM","FO","OA"].map((init, i) => (
                    <div key={init} className="w-12 h-12 rounded-full border-2 border-[#06111F] bg-[#162E52] flex items-center justify-center font-extrabold text-[13px] text-[#00C2FF] -ml-2 first:ml-0 z-[3]" style={{ zIndex: 3 - i, fontFamily: "'Syne', sans-serif" }}>
                      {init}
                    </div>
                  ))}
                </div>
                <div className="bg-[#06111F]/80 backdrop-blur border border-cyan-900/50 rounded-xl px-6 py-4 text-center">
                  <p className="font-extrabold text-[22px] text-[#00C2FF] leading-none mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>3 New</p>
                  <p className="text-[12px] text-white/50">Candidates matched today</p>
                </div>
              </div>
              <div className="absolute bottom-5 right-5 bg-[#06111F]/80 backdrop-blur border border-cyan-900/40 rounded-xl px-4 py-3">
                <p className="text-[11px] text-white/50 mb-1">Avg. placement time</p>
                <p className="font-extrabold text-[20px] text-[#00C2FF] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>48hrs</p>
              </div>
            </div>
          </div>

          {/* 3 sub-cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {platformCards.map((c) => (
              <div key={c.tag} className={`psc rounded-2xl p-8 bg-gradient-to-br ${c.color} border border-slate-100 transition-all duration-300`}>
                <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#0096C7] mb-3">{c.tag}</p>
                <h4 className="font-display font-extrabold text-[17px] text-[#06111F] mb-3 leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>{c.title}</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">{c.desc}</p>
                <div className="mt-5 h-20 rounded-xl bg-white/60 flex items-center justify-center text-3xl">{["🎯","📊","✅"][platformCards.indexOf(c)]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FIND TALENT ANYWHERE ══════════════════════ */}
      <section className="bg-slate-50 py-20" id="brands">
        <div className="max-w-5xl mx-auto px-7">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#0096C7] mb-3">DigiHire</p>
              <h2 className="font-display font-extrabold text-[#06111F] leading-tight mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 3.5vw, 38px)" }}>
                Find Talent<br />from anywhere
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
                Access fully verified talent across Nigeria, Ghana, Kenya, South Africa and beyond — with comprehensive checks on background, criminal records, and education.
              </p>
              <Link to="/join-now?role=talent" className="btn-launch inline-flex items-center gap-2 text-[14px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-lg px-6 py-3 transition-all duration-200" style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 3px 16px rgba(0,194,255,0.3)" }}>
                Download App →
              </Link>
            </div>
            {/* Network viz */}
            <div className="relative h-[300px] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                {[["50%","50%","50%","8%"],["50%","50%","92%","50%"],["50%","50%","50%","92%"],["50%","50%","8%","50%"],["50%","50%","80%","22%"],["50%","50%","20%","78%"]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00C2FF" strokeWidth="1" strokeOpacity="0.15"/>
                ))}
              </svg>
              <div className="w-16 h-16 rounded-full bg-[#00C2FF] flex items-center justify-center text-[11px] font-extrabold text-[#06111F] z-10 shadow-[0_0_0_12px_rgba(0,194,255,0.1),0_0_0_24px_rgba(0,194,255,0.05)]" style={{ fontFamily: "'Syne', sans-serif" }}>DigiHire</div>
              {[{flag:"🇳🇬",pos:"top-4 left-1/2 -translate-x-1/2"},{flag:"🇬🇭",pos:"top-1/2 right-4 -translate-y-1/2"},{flag:"🇿🇦",pos:"bottom-4 left-1/2 -translate-x-1/2"},{flag:"🇰🇪",pos:"top-1/2 left-4 -translate-y-1/2"},{flag:"🌍",pos:"top-[18%] right-[18%]"},{flag:"🌐",pos:"bottom-[18%] left-[18%]"}].map((n) => (
                <div key={n.flag} className={`absolute ${n.pos} w-11 h-11 rounded-full bg-[#06111F] border border-cyan-900/50 flex items-center justify-center text-xl hover:scale-110 transition-transform`}>{n.flag}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ HIRING CTA (dark) ═════════════════════════ */}
      <section className="bg-[#06111F] py-20" id="hiring">
        <div className="max-w-5xl mx-auto px-7">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#00C2FF] mb-4">DigiHire for Business</p>
              <h2 className="font-display font-extrabold text-white leading-tight mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 3.5vw, 38px)" }}>
                Hire talent with DigiHire to fuel your business growth and unlock value.
              </h2>
              <p className="text-[15px] text-slate-400 leading-relaxed mb-8">
                Our end-to-end hiring solution handles everything — from talent discovery to onboarding — so your team can focus on what matters.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {hiringSteps.map((s) => (
                  <div key={s} className="flex items-center gap-3 text-[14px] text-white/80 font-medium">
                    <div className="w-5 h-5 rounded-full bg-[#00C2FF] flex items-center justify-center text-[#06111F] text-[10px] font-black flex-shrink-0">✓</div>
                    {s}
                  </div>
                ))}
              </div>
              <Link to="/join-now?role=brand" className="btn-launch inline-flex items-center gap-2 text-[15px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-xl px-8 py-4 transition-all duration-200" style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 4px 24px rgba(0,194,255,0.4)" }}>
                Get Started →
              </Link>
              {/* Process grid */}
              <div className="grid grid-cols-3 mt-8 border border-white/10 rounded-2xl overflow-hidden">
                {[["01","Source","We find and screen the best candidates"],["02","Assess","Technical & soft skills evaluation"],["03","Hire","Shortlist, interview, offer, onboard"]].map(([n,l,d]) => (
                  <div key={n} className="bg-[#0B1D33] hover:bg-[#0F2544] transition-colors p-5">
                    <p className="font-extrabold text-[20px] text-[#00C2FF] mb-1 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{n}</p>
                    <p className="font-bold text-[13px] text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{l}</p>
                    <p className="text-[12px] text-slate-500 leading-snug">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card */}
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F2544] to-[#1D3A64] min-h-[400px] flex items-center justify-center relative">
              <span className="text-[100px] opacity-10">👤</span>
              <div className="absolute bottom-6 left-6 bg-[#06111F]/85 backdrop-blur border border-cyan-900/40 rounded-xl p-4">
                <p className="font-bold text-[13px] text-white mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>Adewale Anku</p>
                <p className="text-[11px] text-slate-400 mb-2">Product Sales · Lagos</p>
                <span className="inline-flex items-center gap-1 bg-[#00C2FF] text-[#06111F] text-[10px] font-extrabold px-2 py-1 rounded" style={{ fontFamily: "'Syne', sans-serif" }}>✓ Verified Profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INSIGHTS ═══════════════════════════════════ */}
      <section className="bg-white py-20" id="insights">
        <div className="max-w-5xl mx-auto px-7">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display font-extrabold text-[#06111F] tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 2.5vw, 28px)" }}>
              Insights & Resources
            </h2>
            <a href="#" className="text-[14px] font-semibold text-[#00C2FF] hover:underline">Explore our Blog →</a>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {blogPosts.map((p) => (
              <div key={p.title} className="blog-card border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer">
                <div className="h-44 bg-gradient-to-br from-[#0F2544] to-[#1D3A64] flex items-center justify-center text-5xl">{p.emoji}</div>
                <div className="p-5">
                  <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#00C2FF] mb-2">{p.cat}</p>
                  <h4 className="font-display font-bold text-[15px] text-[#06111F] leading-snug mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{p.title}</h4>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════ */}
      <section className="bg-[#06111F] py-20 text-center" id="training">
        <div className="max-w-2xl mx-auto px-7">
          <h2 className="font-display font-extrabold text-white leading-tight mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 4vw, 44px)" }}>
            Build your team with top African<br />talent using DigiHire
          </h2>
          <p className="text-[16px] text-slate-400 mb-10 leading-relaxed">
            Connect with verified, pre-screened tech sales professionals. Your next great hire is already on the platform.
          </p>
          <Link to="/join-now?role=brand" className="btn-launch inline-flex items-center gap-2 text-[15px] font-extrabold text-[#06111F] bg-[#00C2FF] rounded-xl px-10 py-4 transition-all duration-200" style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 4px 24px rgba(0,194,255,0.4)" }}>
            Find Top Talent →
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════ */}
      <footer className="bg-[#06111F] border-t border-white/5 pt-14 pb-8">
        <div className="max-w-5xl mx-auto px-7">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#00C2FF] flex items-center justify-center">
                  <svg viewBox="0 0 18 18" className="w-4 h-4 fill-[#06111F]">
                    <path d="M2 9C2 5.13 5.13 2 9 2s7 3.13 7 7-3.13 7-7 7S2 12.87 2 9zm7-4L6 9h3l-1 4 5-6h-3l1-2z"/>
                  </svg>
                </div>
                <span className="font-display font-extrabold text-[17px] text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Digi<span className="text-[#00C2FF]">Hire</span>
                </span>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[200px] mb-5">
                Africa's premier tech sales talent platform. Connecting top professionals with forward-thinking companies.
              </p>
              <div className="flex gap-2">
                {["𝕏","in","f","ig"].map((s) => (
                  <a key={s} href="#" className="w-8 h-8 rounded-lg bg-[#0B1D33] border border-white/8 text-slate-400 flex items-center justify-center text-[13px] hover:border-cyan-900 hover:text-[#00C2FF] transition-all">{s}</a>
                ))}
              </div>
            </div>

            {/* Cols */}
            {[
              { title: "For Hiring Manager", links: ["Dashboard","Diversity","Pricing","Partnerships","Find Jobs"] },
              { title: "For Talent",         links: ["Academy","Leaderboard","Resume Review","Community","Find Jobs"] },
              { title: "Company",            links: ["About","Careers","Blog","Privacy Policy","Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-[13px] text-slate-400 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[12px] text-slate-500">© 2025 DigiHire Africa Ltd. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              {[["📍","Lagos, Nigeria — 7 Adewale Close, Surulere"],["📍","Accra, Ghana"],["📍","Nairobi, Kenya"]].map(([pin, loc]) => (
                <span key={loc} className="flex items-center gap-1 text-[11px] text-slate-500">{pin} {loc}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
