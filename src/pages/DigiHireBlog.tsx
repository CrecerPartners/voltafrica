import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ArrowRight, 
  Calendar, 
  User, 
  ChevronRight,
  Send,
  ArrowUpRight
} from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";

const categories = [
  "All",
  "Sales",
  "Recruitment",
  "Campaigns",
  "Activations",
  "Talent Growth",
  "Future of Work",
  "DigiHire Updates"
];

const articles = [
  {
    id: 1,
    title: "The Future of Gen Z Recruitment in Africa",
    excerpt: "How peer-to-peer networks are redefining how brands connect with the next generation of talent and consumers.",
    category: "Future of Work",
    date: "May 12, 2024",
    author: "DigiHire Team",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "5 Strategies to Scale Your Campus Activations",
    excerpt: "Practical tips for brands looking to achieve maximum saturation and engagement across Nigerian campuses.",
    category: "Activations",
    date: "May 10, 2024",
    author: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1523240715639-963c7a794e7b?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "Mastering Peer-to-Peer Sales on WhatsApp",
    excerpt: "Why the 'Status' is the most powerful sales tool in your pocket and how to leverage it effectively.",
    category: "Sales",
    date: "May 8, 2024",
    author: "David Alabi",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    title: "Building a Career in the Gig Economy",
    excerpt: "Navigating the new landscape of work where flexibility meets high-performance and financial freedom.",
    category: "Talent Growth",
    date: "May 5, 2024",
    author: "DigiHire Insights",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    title: "Why Traditional Influencer Marketing is Fading",
    excerpt: "The shift from vanity metrics to real, peer-driven conversion and community-led adoption.",
    category: "Campaigns",
    date: "May 2, 2024",
    author: "Michael Chen",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    title: "DigiHire Q2 Product Roadmap Update",
    excerpt: "Exciting new features coming to our talent and brand dashboards to drive even more results.",
    category: "DigiHire Updates",
    date: "April 28, 2024",
    author: "Engineering Team",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60"
  }
];

const featuredArticle = {
  title: "Building the Engine of Economic Opportunity for African Youth",
  excerpt: "DigiHire is more than just a marketplace; it's a platform designed to unlock the massive potential of the Gen Z workforce through technology, trust, and community.",
  category: "Vision",
  date: "May 15, 2024",
  author: "Founder's Desk",
  image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80"
};

export default function DigiHireBlog() {
  const [activeCategory, setActiveCategory] = React.useState("All");

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-44 md:pb-24 border-b">
        <div className="container px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Blog & Insights
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Insights on <span className="text-primary italic">sales</span>, growth, hiring, and market activation
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10">
              Explore practical ideas, strategies, and stories from the DigiHire ecosystem. 
              Built for brands that want results and talent that wants to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-10 h-12 bg-muted/50 border-border/50 focus:ring-primary"
                />
              </div>
              <Button size="lg" className="h-12 px-8 font-bold">
                Read Latest Articles
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl aspect-[16/10]">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1">
                  {featuredArticle.category}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {featuredArticle.date}
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 hover:text-primary transition-colors cursor-pointer leading-tight">
                {featuredArticle.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{featuredArticle.author}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Thought Leadership</p>
                </div>
              </div>
              <Button size="lg" className="group h-14 px-10 text-lg font-bold">
                Read Full Article
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-8 mb-12 scrollbar-hide no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Card key={article.id} className="group border-none shadow-none bg-transparent hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="p-0 mb-6">
                  <div className="overflow-hidden rounded-xl border border-border/50 aspect-[16/10] relative">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-background/90 backdrop-blur-sm text-foreground hover:bg-background border-none font-bold">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>5 min read</span>
                  </div>
                  <CardTitle className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <Link 
                    to={`/blog/${article.id}`} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary group/link"
                  >
                    Read More
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-20 text-center">
            <Button variant="outline" size="lg" className="h-14 px-12 border-2 font-bold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
              Explore All Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 border-t">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto rounded-[32px] bg-primary p-8 md:p-16 text-primary-foreground overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-3/5 text-center md:text-left">
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Get DigiHire insights delivered to you
                </h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl">
                  Stay updated with our latest thoughts on sales, growth, and the future of work in Africa. No spam, just value.
                </p>
              </div>
              <div className="md:w-2/5 w-full">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <form className="flex flex-col gap-4">
                    <Input 
                      placeholder="Email Address" 
                      className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white"
                    />
                    <Button size="lg" className="h-14 bg-white text-primary hover:bg-white/90 font-bold w-full group shadow-xl">
                      Subscribe Now
                      <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                    <p className="text-[10px] text-center text-white/60 uppercase tracking-widest font-bold">
                      Join 5,000+ professionals across Nigeria
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Secondary CTA */}
      <footer className="py-16 bg-muted/30">
        <div className="container px-4 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">Twitter</Button>
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">LinkedIn</Button>
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">Instagram</Button>
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">YouTube</Button>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} DigiHire. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
