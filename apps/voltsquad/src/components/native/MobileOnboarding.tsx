import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@digihire/shared";
import { ArrowRight } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export function MobileOnboarding() {
  const [step, setStep] = useState(0);

  const slides = [
    {
      image: "/1.png",
      title: "Welcome to VoltAfrica",
      description: "The ultimate Gen Z distribution network. Discover amazing products and brands to sell.",
    },
    {
      image: "/2.png",
      title: "Share & Influence",
      description: "Leverage your community and social networks to drive sales without paying for ads.",
    },
    {
      image: "/3.png",
      title: "Earn Real Commissions",
      description: "Get paid automatically for every sale you make. Track everything right from your phone.",
    }
  ];

  const currentSlide = slides[step];

  const nextStep = async () => {
    if (step < slides.length - 1) {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      setStep(step + 1);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background relative overflow-hidden pt-safe pb-safe">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          key={step}
          src={currentSlide.image} 
          alt="" 
          className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" 
        />
        {/* Overlays for readability and branding */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-20" />
      </div>

      {/* Background blobs (restored for app styling, adjusted opacity for background image) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />

      {/* Bottom Text and Navigation Area */}
      <div className="w-full flex-1 flex flex-col justify-end z-20 pb-8 relative bg-gradient-to-t from-background via-background/90 to-transparent">
        
        {/* Text Content */}
        <div className="px-6 flex flex-col items-center mb-8 pt-10">
          <h1 className="font-display text-3xl font-bold md:text-4xl mb-4 text-foreground leading-tight text-center">
            {currentSlide.title}
          </h1>
          <p className="text-muted-foreground text-center text-base md:text-lg max-w-[300px] leading-relaxed">
            {currentSlide.description}
          </p>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`} 
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="w-full px-6 mb-safe">
          {step < slides.length - 1 ? (
            <Button onClick={nextStep} size="lg" className="w-full rounded-2xl h-14 text-base font-medium volt-gradient shadow-lg group transition-all">
              Continue <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <div className="flex flex-col gap-3 animate-fade-in w-full">
              <Button asChild size="lg" className="w-full rounded-2xl h-14 text-base font-medium volt-gradient shadow-lg hover:opacity-90 transition-all">
                <Link to="/join-now">Create an Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full rounded-2xl h-14 text-base font-medium border-border text-foreground bg-background/50 backdrop-blur hover:bg-muted/50 transition-all">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


