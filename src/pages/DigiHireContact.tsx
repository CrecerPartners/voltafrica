import React from "react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Calendar, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Briefcase, 
  Flag,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DigiHireContact() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(0,194,255,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="container px-4 relative z-10">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Contact DigiHire
          </Badge>
          <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
            Talk to us
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Whether you want to launch a campaign, hire sales talent, book activations, or learn more about DigiHire, our team is ready to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-base font-bold">
              <Calendar className="mr-2 h-5 w-5" /> Book a Call
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold border-white/20 text-white hover:bg-white/10">
              <Mail className="mr-2 h-5 w-5" /> Email Us
            </Button>
            <Button size="lg" className="h-14 px-8 text-base font-bold bg-[#25D366] hover:bg-[#25D366]/90 border-none">
              <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left: Talk to Sales Card */}
            <div className="bg-slate-950 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/20 transition-colors" />
              <div className="relative z-10">
                <Badge variant="outline" className="mb-6 border-primary/30 text-primary/80 font-bold px-3 py-1 uppercase tracking-widest text-[10px]">
                  Sales & Partnerships
                </Badge>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                  Talk to Sales
                </h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  Book a call with our team to discuss campaigns, recruitment, activations, or partnerships. We will help you find the right solution for your goals.
                </p>
                
                <Button size="lg" className="w-full md:w-auto h-14 px-10 text-lg font-bold mb-12 shadow-xl shadow-primary/20">
                  <Calendar className="mr-2 h-5 w-5" /> Book a Call
                </Button>

                <div className="h-px bg-white/10 w-full mb-10" />

                <div className="space-y-6">
                  <a href="mailto:sales@digihire.io" className="flex items-center gap-4 text-slate-400 hover:text-primary transition-colors group/link">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/link:border-primary/30">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium">sales@digihire.io</span>
                  </a>
                  <a href="https://wa.me/2347073848138" className="flex items-center gap-4 text-slate-400 hover:text-[#25D366] transition-colors group/link">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/link:border-[#25D366]/30">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium">Chat with us on WhatsApp</span>
                  </a>
                  <a href="tel:07073848138" className="flex items-center gap-4 text-slate-400 hover:text-primary transition-colors group/link">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover/link:border-primary/30">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium">0707 384 8138</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Information */}
            <div className="flex flex-col gap-12">
              
              {/* Offices */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-8">Our Offices</h3>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Nigeria Headquarters</h4>
                      <p className="text-slate-600 leading-relaxed">39 Ikorodu Road, Jibowu, Yaba, Lagos, Nigeria</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">United Kingdom Headquarters</h4>
                      <p className="text-slate-600 leading-relaxed">Unit 82a James Carter Road, Mildenhall, Bury St. Edmunds, IP28 7DE</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Addresses */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-8">Email Enquiries</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <Mail className="h-5 w-5 text-primary mb-4" />
                    <h4 className="font-bold text-slate-900 text-sm mb-1">General</h4>
                    <p className="text-primary font-medium text-sm">hey@digihire.io</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <Briefcase className="h-5 w-5 text-primary mb-4" />
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Sales</h4>
                    <p className="text-primary font-medium text-sm">sales@digihire.io</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <Flag className="h-5 w-5 text-primary mb-4" />
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Nigeria Office</h4>
                    <p className="text-primary font-medium text-sm">digihirenigeria@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strip CTA */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Ready to get started?</h2>
              <p className="text-slate-600 text-lg">Pick the channel that works best for you and our team will take it from there.</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="h-14 px-8 font-bold">Book a Call</Button>
              <Button size="lg" variant="outline" className="h-14 px-8 font-bold border-slate-300 text-slate-700 hover:bg-slate-100">Email Us</Button>
              <Button size="lg" className="h-14 px-8 font-bold bg-[#25D366] hover:bg-[#25D366]/90">WhatsApp</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} DigiHire Africa Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
