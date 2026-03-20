import { useEffect, useState } from "react";

export function NativeSplash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for fade animation to finish
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[999] bg-black flex items-center justify-center transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      <div className="relative">
        {/* Pulsing glow background */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse scale-150" />
        
        {/* Animated Logo */}
        <img 
          src="/Volt1.png" 
          alt="Volt Logo" 
          className="h-24 w-auto relative z-10 animate-bounce transition-transform duration-1000 ease-in-out"
          style={{ animationDuration: '2s' }}
        />
      </div>
    </div>
  );
}
