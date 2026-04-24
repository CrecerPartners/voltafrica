import React from "react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Globe, 
  Bell,
  ArrowRight,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const eventCategories = [
  { id: "all", label: "All Events" },
  { id: "webinar", label: "Webinars" },
  { id: "meetup", label: "Meetups" },
  { id: "training", label: "Training Sessions" },
  { id: "community", label: "Community Events" }
];

const events = [
  {
    id: 1,
    category: "webinar",
    format: "Virtual",
    title: "Breaking Into Tech Sales: A Practical Guide for Beginners",
    desc: "Learn how to land your first tech sales role even with zero prior experience.",
    date: "Wednesday, 14 May 2025",
    time: "6:00 PM WAT",
    location: "Online — Zoom",
    seats: 42,
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=700&h=400&fit=crop&q=80"
  },
  {
    id: 2,
    category: "meetup",
    format: "In-Person",
    title: "DigiHire Lagos Sales Meetup — May Edition",
    desc: "A community evening for sales talent, brand reps, and growth-minded professionals in Lagos.",
    date: "Friday, 23 May 2025",
    time: "5:00 PM — 8:00 PM WAT",
    location: "The Hive, Victoria Island, Lagos",
    seats: 18,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=700&h=400&fit=crop&q=80"
  },
  {
    id: 3,
    category: "training",
    format: "Virtual",
    title: "Sales Academy Bootcamp: Closing Techniques That Work",
    desc: "A practical two-hour training session on closing frameworks, objection handling, and follow-up systems.",
    date: "Saturday, 31 May 2025",
    time: "10:00 AM — 12:00 PM WAT",
    location: "Online — Google Meet",
    seats: 60,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&h=400&fit=crop&q=80"
  },
  {
    id: 4,
    category: "community",
    format: "In-Person",
    title: "VoltSquad Seller Community Day — Abuja",
    desc: "Connect with fellow VoltSquad sellers, share wins, learn from top earners, and get campaign updates.",
    date: "Saturday, 7 June 2025",
    time: "11:00 AM — 2:00 PM WAT",
    location: "Transcorp Hilton, Abuja",
    seats: 35,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=700&h=400&fit=crop&q=80"
  },
  {
    id: 5,
    category: "webinar",
    format: "Virtual",
    title: "How Brands Win with Human-Led Sales Campaigns",
    desc: "A brand-focused webinar on campaign strategy, field activation planning, and using VoltSquad for growth.",
    date: "Thursday, 12 June 2025",
    time: "3:00 PM WAT",
    location: "Online — Zoom",
    seats: 80,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&h=400&fit=crop&q=80"
  },
  {
    id: 6,
    category: "training",
    format: "Virtual",
    title: "CV & LinkedIn Masterclass for Sales Professionals",
    desc: "Build a standout CV and optimise your LinkedIn profile to attract recruiters and land better sales roles.",
    date: "Saturday, 21 June 2025",
    time: "10:00 AM WAT",
    location: "Online — Zoom",
    seats: 55,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&h=400&fit=crop&q=80"
  }
];

export default function DigiHireEvents() {
  const [activeTab, setActiveTab] = React.useState("all");

  const filteredEvents = activeTab === "all" 
    ? events 
    : events.filter(e => e.category === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(0,194,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="container px-4 relative z-10">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Events & Community
          </Badge>
          <h1 className="font-display text-4xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Join our upcoming <span className="text-primary italic">webinars,</span><br/>meetups, and community events
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stay connected to DigiHire's latest training sessions, meetups, activations, and community experiences.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg font-bold">
            <Calendar className="mr-2 h-5 w-5" /> View Upcoming Events
          </Button>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-6">
        <div className="container px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {eventCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeTab === cat.id
                    ? "bg-slate-950 text-white border-slate-950"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Event */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-8">Featured Event</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 group">
            <div className="relative aspect-video lg:aspect-auto overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop&q=80" 
                alt="Featured event"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6">
                <Badge className="bg-primary text-white border-none font-bold">Featured</Badge>
              </div>
              <div className="absolute top-6 right-6">
                <Badge className="bg-slate-950/70 backdrop-blur-md text-white border-white/20 flex items-center gap-1.5 px-3 py-1.5">
                  <Video className="h-3 w-3" /> Virtual
                </Badge>
              </div>
            </div>
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-6 font-medium">
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Saturday, 10 May 2025</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> 2:00 PM — 4:00 PM WAT</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-6 group-hover:text-primary transition-colors leading-tight">
                How to Launch Your First Sales Campaign on VoltSquad
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">
                Join our team for a live walkthrough of how brands use VoltSquad to launch structured sales campaigns, activate sellers, and drive real user acquisition — from setup to results.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-14 px-10 text-lg font-bold">Register Now →</Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold">Learn More</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-20 bg-slate-50">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-slate-900">Upcoming Events</h2>
            <Button variant="link" className="text-primary font-bold">View all →</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-xl group">
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none font-bold">
                      {event.category.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-slate-950/70 backdrop-blur-md text-white border-white/10 flex items-center gap-1 px-2 py-1 text-[10px]">
                      {event.format === "Virtual" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {event.format}
                    </Badge>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {event.desc}
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <Calendar className="h-4 w-4 text-primary/60" /> {event.date}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <Clock className="h-4 w-4 text-primary/60" /> {event.time}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      {event.format === "Virtual" ? <Globe className="h-4 w-4 text-primary/60" /> : <MapPin className="h-4 w-4 text-primary/60" />}
                      {event.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Spots left: <span className="text-primary font-bold">{event.seats}</span></span>
                    <Button size="sm" className="font-bold">Register</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">Past Events</h2>
            <Button variant="link" className="text-primary font-bold">View all recaps →</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Intro to VoltSquad — Campaign Launch Webinar", date: "March 15, 2025 · Virtual" },
              { title: "DigiHire Lagos Q1 Sales Meetup", date: "February 28, 2025 · Lagos, Nigeria" },
              { title: "Sales Academy — Prospecting Workshop", date: "January 18, 2025 · Virtual" }
            ].map((past, i) => (
              <div key={i} className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-20 w-20 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                  <img src={`https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&h=200&fit=crop&q=80`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug group-hover:text-primary transition-colors">{past.title}</h4>
                  <p className="text-[11px] text-slate-400">{past.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-950 text-white text-center">
        <div className="container px-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Want to stay updated on DigiHire events?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join our community and keep up with upcoming webinars, meetups, and training sessions.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90">
            <Bell className="mr-2 h-5 w-5" /> Follow Updates
          </Button>
        </div>
      </section>

      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} DigiHire Africa Ltd. All rights reserved.</p>
      </footer>
    </div>
  );
}
