import { Button } from '@/components/ui/button';
import { FloatingParticles } from './FloatingParticles';
import { Bubbles } from './Bubbles';
import { LightRays } from './LightRays';
import { ChevronDown } from 'lucide-react';
export const HeroSection = () => {
  const scrollToContent = () => {
    const element = document.getElementById('overview');
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-ocean" />
      <LightRays />
      <FloatingParticles />
      <Bubbles />
      
      {/* Atlantis silhouette overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Pre-title */}
        <p className="text-primary/80 text-sm md:text-base tracking-[0.3em] uppercase mb-4 animate-fade-in opacity-0" style={{
        animationDelay: '0.2s'
      }}>GOVERNMENT MEDICAL COLLEGE AND HOSPITAL, CHANDIGARH
PRESENTS</p>
        
        {/* Main title */}
        <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 text-glow animate-fade-in opacity-0" style={{
        animationDelay: '0.4s'
      }}>
          EUPHORIA
        </h1>
        
        {/* Year badge */}
        <div className="inline-block mb-6 animate-fade-in opacity-0" style={{
        animationDelay: '0.6s'
      }}>
          <span className="font-cinzel text-lg md:text-xl text-accent tracking-[0.2em] border border-accent/30 px-6 py-2 rounded-full text-glow-gold">
            2026
          </span>
        </div>
        
        {/* Tagline */}
        <p className="font-raleway text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 animate-fade-in opacity-0" style={{
        animationDelay: '0.8s'
      }}>Lost City of Atlantis<span className="text-primary text-glow">Lost City</span>
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in opacity-0" style={{
        animationDelay: '1s'
      }}>
          <Button size="lg" className="min-w-[180px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] animate-glow-pulse">
            Explore Events
          </Button>
          <Button size="lg" variant="outline" className="min-w-[180px] border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)]">
            Buy Passes
          </Button>
          <Button size="lg" variant="outline" className="min-w-[180px] border-primary/50 text-primary hover:bg-primary/10 font-semibold tracking-wide transition-all duration-300">
            Register Now
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <button onClick={scrollToContent} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary/60 hover:text-primary transition-colors animate-float cursor-pointer" aria-label="Scroll to content">
        <ChevronDown size={32} />
      </button>
    </section>;
};