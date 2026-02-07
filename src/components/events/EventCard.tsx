import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Trophy, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Event {
  id: string;
  name: string;
  category: 'cultural' | 'gaming' | 'workshop';
  day: 1 | 2 | 3;
  teamSize: string;
  duration: string;
  fee: number;
  prizePool: string;
  description: string;
  posterUrl?: string;
}

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
}

const categoryColors = {
  cultural: 'primary',
  gaming: 'coral',
  workshop: 'mystic',
} as const;

export const EventCard = ({ event, onRegister }: EventCardProps) => {
  const colorKey = categoryColors[event.category];
  
  return (
    <Card className={cn(
      "group glass-card border-border/50 overflow-hidden transition-all duration-500",
      "hover:scale-[1.02] hover:border-primary/50",
      `hover:shadow-[0_0_40px_hsl(var(--${colorKey})/0.3)]`
    )}>
      {/* Poster area */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
        {event.posterUrl ? (
          <img 
            src={event.posterUrl} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-cinzel text-2xl text-muted-foreground/50">
              {event.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Category badge */}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase",
          "bg-background/80 backdrop-blur-sm border",
          colorKey === 'primary' && "border-primary/50 text-primary",
          colorKey === 'coral' && "border-coral/50 text-coral",
          colorKey === 'mystic' && "border-mystic/50 text-mystic",
        )}>
          {event.category}
        </div>
        
        {/* Day badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm border border-border/50 text-foreground">
          Day {event.day}
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-cinzel text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {event.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        {/* Event details */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{event.teamSize}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-accent" />
            <span>{event.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="w-4 h-4 text-coral" />
            <span>₹{event.fee}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="w-4 h-4 text-mystic" />
            <span>{event.prizePool}</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => onRegister?.(event.id)}
        >
          Register Now
        </Button>
      </CardContent>
    </Card>
  );
};
