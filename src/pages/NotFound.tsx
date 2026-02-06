import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-ocean opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-ocean-deep to-transparent" />
      
      {/* Floating bubbles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-primary/20 bg-primary/5 animate-bubble"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '0',
            width: `${Math.random() * 12 + 6}px`,
            height: `${Math.random() * 12 + 6}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 6 + 6}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-float">
            <Waves className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="font-cinzel text-6xl md:text-8xl font-bold text-foreground mb-4 text-glow">
          404
        </h1>
        
        <p className="font-cinzel text-xl md:text-2xl text-muted-foreground mb-2">
          Lost in the Depths
        </p>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You have wandered too far from Atlantis. The currents have carried you to uncharted waters.
        </p>
        
        <Button 
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground animate-glow-pulse"
        >
          <a href="/">Return to Atlantis</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
