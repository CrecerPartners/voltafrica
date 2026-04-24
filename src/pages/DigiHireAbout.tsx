import React from "react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Target, 
  Zap, 
  Users, 
  GraduationCap, 
  Briefcase, 
  MapPin,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DigiHireAbout() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,194,255,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="container px-4 relative z-10 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1 text-xs font-bold uppercase tracking-widest">
            About DigiHire
          </Badge>
          <h1 className="font-display text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto">
            Building the sales ecosystem where <span className="text-primary italic">brands, talent,</span> and opportunity connect
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            DigiHire helps brands grow through structured sales campaigns, recruitment, activations, and training, while helping sales talent access gigs, jobs, and career-building opportunities through one connected platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-10 text-lg font-bold">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-white/20 text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4 border-primary text-primary font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
                  Who We Are
                </Badge>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                  A modern sales network for brands and talent
                </h2>
              </div>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  DigiHire is building a modern sales network for brands that need traction and talent that needs opportunity. We exist to connect businesses to real people who can sell — whether that means launching structured campaigns, recruiting sales talent, running field activations, or training the next generation of sales professionals.
                </p>
                <p>
                  We are not just building a platform. We are building the structure that helps brands launch faster, hire smarter, and activate markets more effectively — while helping sales talent earn, grow, and build stronger careers.
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-2xl group-hover:bg-primary/20 transition-all" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=680&fit=crop&q=80" 
                  alt="DigiHire team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-slate-950">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-primary/20 rounded-3xl p-10 md:p-14 hover:bg-white/[0.08] transition-all group">
              <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-6">Our Vision</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                To build the most trusted sales ecosystem for brands and talent across Africa — where businesses can access the people they need to grow, and talent can access the opportunities they need to earn, learn, and thrive.
              </p>
            </div>
            <div className="bg-white/5 border border-primary/20 rounded-3xl p-10 md:p-14 hover:bg-white/[0.08] transition-all group">
              <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                To help brands drive growth through people-powered sales execution while helping sales talent unlock income, experience, and long-term career opportunities. We do this by creating structured systems for campaigns, recruitment, field activations, and sales training.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge variant="outline" className="mb-4 border-primary text-primary font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
              Our Ecosystem
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need in one place
            </h2>
            <p className="text-lg text-slate-600">
              Five connected solutions that power brands and talent on both sides of the market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Zap, 
                title: "VoltSquad", 
                desc: "Our campaign marketplace where brands launch structured sales campaigns and sellers earn through real sales activity." 
              },
              { 
                icon: Users, 
                title: "Talent Pool", 
                desc: "A structured profile and matching system that helps brands discover sales talent and helps talent access better job opportunities." 
              },
              { 
                icon: GraduationCap, 
                title: "Sales Academy", 
                desc: "A modern training platform where sales talent can learn, build practical skills, earn certifications, and prepare for stronger opportunities." 
              },
              { 
                icon: Briefcase, 
                title: "Sales Recruitment", 
                desc: "End-to-end recruitment support for brands looking for sales reps, closers, field teams, merchandisers, and business development talent." 
              },
              { 
                icon: MapPin, 
                title: "Activations & Field Marketing", 
                desc: "On-ground campaign support that helps brands build visibility, drive engagement, and activate markets across key locations." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="h-12 w-12 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <item.icon className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge variant="outline" className="mb-4 border-primary text-primary font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
              How We Work
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              From goal to growth in four steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Understand the goal", desc: "We start with the growth need — whether that is user acquisition, talent hiring, market activation, or sales training." },
              { num: "02", title: "Choose the right route", desc: "We identify the right DigiHire solution — VoltSquad, recruitment, activations, or the Sales Academy." },
              { num: "03", title: "Activate the right people", desc: "We connect brands to the right sellers, talent, or field teams ready to execute with real accountability." },
              { num: "04", title: "Support execution and growth", desc: "We help turn opportunity into measurable outcomes — signups, hires, visibility, and long-term growth." }
            ].map((step, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center group">
                <span className="block font-display text-6xl font-black text-primary/5 mb-4 group-hover:text-primary/10 transition-colors">
                  {step.num}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="container px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-6xl font-bold mb-8 tracking-tight">
            Ready to grow with DigiHire?
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Whether you are a brand looking to launch, hire, or activate — or talent looking to earn, grow, and work with real brands — DigiHire gives you a stronger path forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-10 text-lg font-bold group">
              Talk to Sales
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-white/20 text-white hover:bg-white/10">
              Join DigiHire
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Placeholder (since we don't have a shared footer component yet) */}
      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} DigiHire Africa Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
