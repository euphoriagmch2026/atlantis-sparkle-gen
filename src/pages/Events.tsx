import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { EventCard, Event } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const Events = () => {
  const navigate = useNavigate();
  const { totalItems, totalAmount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTeamType, setSelectedTeamType] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*');
      if (!error && data) {
        setEvents(data.map((e: any) => ({
          id: e.id,
          name: e.name,
          category: e.category as 'cultural' | 'gaming' | 'workshop',
          day: e.day as 1 | 2 | 3,
          teamSize: e.team_size,
          duration: e.duration || '',
          fee: e.fee,
          prizePool: e.prize_pool || '',
          description: e.description || '',
          posterUrl: e.poster_url || undefined,
        })));
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
      if (selectedDay !== null && event.day !== selectedDay) return false;
      if (selectedTeamType !== 'all') {
        const teamSizeLower = event.teamSize.toLowerCase();
        const isSolo = teamSizeLower.includes('solo');
        const isDuet = teamSizeLower.includes('duet');
        if (selectedTeamType === 'solo' && !isSolo) return false;
        if (selectedTeamType === 'duet' && !isDuet) return false;
        if (selectedTeamType === 'team' && (isSolo || isDuet)) return false;
      }
      return true;
    });
  }, [events, selectedCategory, selectedDay, selectedTeamType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">Explore</span>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="text-primary text-glow">Events</span> & Competitions
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive into a world of creativity, innovation, and entertainment. Find your calling in the depths of EUPHORIA.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 shrink-0">
              <div className="glass-card p-6 rounded-xl border border-border/50 sticky top-28">
                <h3 className="font-cinzel text-lg font-semibold text-foreground mb-6">Filter Events</h3>
                <EventFilters
                  selectedCategory={selectedCategory}
                  selectedDay={selectedDay}
                  selectedTeamType={selectedTeamType}
                  onCategoryChange={setSelectedCategory}
                  onDayChange={setSelectedDay}
                  onTeamTypeChange={setSelectedTeamType}
                />
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-6 text-muted-foreground">
                Showing <span className="text-primary font-semibold">{filteredEvents.length}</span> events
              </div>

              {loading ? (
                <div className="text-center py-20 text-muted-foreground">Loading events...</div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-2">No events found</p>
                  <p className="text-muted-foreground/60 text-sm">Try adjusting your filters to discover more events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => navigate('/checkout')}
            size="lg"
            className="h-14 px-6 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse-glow"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Checkout (₹{totalAmount})
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Events;
