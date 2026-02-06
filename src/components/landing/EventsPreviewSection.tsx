import { Music, Code, Gamepad2, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EventCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  eventCount: number;
  color: 'primary' | 'accent' | 'coral' | 'mystic';
}

const categories: EventCategory[] = [
  {
    icon: <Music className="w-10 h-10" />,
    title: 'Cultural',
    description: 'Dance, music, drama, and artistic expressions that celebrate creativity.',
    eventCount: 15,
    color: 'primary',
  },
  {
    icon: <Gamepad2 className="w-10 h-10" />,
    title: 'Gaming',
    description: 'Esports tournaments, casual gaming, and VR experiences.',
    eventCount: 8,
    color: 'coral',
  },
  {
    icon: <Palette className="w-10 h-10" />,
    title: 'Pro Shows',
    description: 'Star-studded performances and exclusive entertainment.',
    eventCount: 5,
    color: 'mystic',
  },
];

const getColorClasses = (color: EventCategory['color']) => {
  const colors = {
    primary: {
      icon: 'text-primary',
      glow: 'group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]',
      border: 'group-hover:border-primary/50',
    },
    accent: {
      icon: 'text-accent',
      glow: 'group-hover:shadow-[0_0_40px_hsl(var(--accent)/0.4)]',
      border: 'group-hover:border-accent/50',
    },
    coral: {
      icon: 'text-coral',
      glow: 'group-hover:shadow-[0_0_40px_hsl(var(--coral)/0.4)]',
      border: 'group-hover:border-coral/50',
    },
    mystic: {
      icon: 'text-mystic',
      glow: 'group-hover:shadow-[0_0_40px_hsl(var(--mystic-purple)/0.4)]',
      border: 'group-hover:border-mystic/50',
    },
  };
  return colors[color];
};

export const EventsPreviewSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">
            Discover
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured <span className="text-primary text-glow">Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From electrifying performances to mind-bending tech challenges, 
            explore the diverse realms of EUPHORIA.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <Card 
                key={category.title}
                className={`group glass-card border-border/50 hover:scale-105 transition-all duration-500 cursor-pointer ${colorClasses.glow} ${colorClasses.border}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`${colorClasses.icon} mb-4 flex justify-center transition-transform duration-300 group-hover:scale-110`}>
                    {category.icon}
                  </div>
                  <h3 className="font-cinzel text-xl font-semibold text-foreground mb-2">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <span className="text-xs text-primary/80 tracking-wider">
                    {category.eventCount} EVENTS
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
};
