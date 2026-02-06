import { useEffect, useRef, useState } from 'react';

const legendParagraphs = [
  "In the depths of time, before history was written, there existed a civilization so advanced, so magnificent, that its very name echoed through eternity...",
  "Atlantis — the jewel of the ancient world, where knowledge flowed like water and creativity knew no bounds.",
  "But the seas claimed this wonder, and for millennia, it lay dormant beneath the waves, waiting for those brave enough to seek its secrets.",
  "Now, the lost city rises once more. Not in stone and mortar, but in spirit and celebration.",
  "EUPHORIA awakens — carrying the legacy of Atlantis into a new age of wonder."
];

export const LegendSection = () => {
  const [visibleParagraphs, setVisibleParagraphs] = useState<number[]>([]);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const observers = paragraphRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleParagraphs(prev => 
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        },
        { threshold: 0.5 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Deeper underwater gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-ocean-mid to-ocean-light opacity-50" />
      
      {/* Decorative elements */}
      <div className="absolute left-4 top-1/4 w-px h-1/2 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute right-4 top-1/3 w-px h-1/3 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
      
      <div className="relative max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">
            The Legend
          </span>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-foreground text-glow">
            The Lost City Awakens
          </h2>
        </div>

        {/* Story paragraphs */}
        <div className="space-y-12">
          {legendParagraphs.map((text, index) => (
            <p
              key={index}
              ref={(el) => (paragraphRefs.current[index] = el)}
              className={`text-lg md:text-xl text-center leading-relaxed transition-all duration-1000 ${
                visibleParagraphs.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              } ${index === legendParagraphs.length - 1 ? 'text-primary text-glow font-semibold' : 'text-muted-foreground'}`}
            >
              {text}
            </p>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mt-16">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/50" />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>
    </section>
  );
};
