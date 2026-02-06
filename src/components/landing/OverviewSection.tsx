import { Calendar, Users, Trophy, Sparkles } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { icon: <Sparkles className="w-8 h-8" />, value: 50, suffix: '+', label: 'Events' },
  { icon: <Users className="w-8 h-8" />, value: 4000, suffix: '+', label: 'Attendees' },
  { icon: <Calendar className="w-8 h-8" />, value: 4, suffix: '', label: 'Days' },
  { icon: <Memories className="w-8 h-8" />, value: 5, suffix: 'K+', label: 'Core Memories' },
];

const AnimatedCounter = ({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, inView]);

  return (
    <span className="font-cinzel text-4xl md:text-5xl font-bold text-primary text-glow">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const OverviewSection = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="overview" ref={sectionRef} className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dive Into the <span className="text-primary text-glow">Experience</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            EUPHORIA is more than a fest — it's an odyssey through music, dance, technology, and creativity.
            Join thousands of students from across the nation in this legendary celebration.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-card rounded-xl p-6 text-center border-glow hover:scale-105 transition-transform duration-300"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s ease ${index * 0.1}s`
              }}
            >
              <div className="text-accent mb-4 flex justify-center">
                {stat.icon}
              </div>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
              <p className="text-muted-foreground mt-2 text-sm uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
