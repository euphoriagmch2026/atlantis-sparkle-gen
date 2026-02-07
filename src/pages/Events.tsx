import { useState, useMemo } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { EventCard, Event } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { FloatingParticles } from '@/components/landing/FloatingParticles';

// Placeholder events - empty structure ready for content
const placeholderEvents: Event[] = [
  {
    id: '1',
    name: 'Event Name',
    category: 'cultural',
    day: 1,
    teamSize: 'Solo',
    duration: '2 hours',
    fee: 100,
    prizePool: '₹10,000',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '2',
    name: 'Event Name',
    category: 'cultural',
    day: 1,
    teamSize: '2-4 members',
    duration: '3 hours',
    fee: 200,
    prizePool: '₹15,000',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '3',
    name: 'Event Name',
    category: 'technical',
    day: 1,
    teamSize: 'Solo',
    duration: '4 hours',
    fee: 150,
    prizePool: '₹20,000',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '4',
    name: 'Event Name',
    category: 'technical',
    day: 2,
    teamSize: '2-3 members',
    duration: '6 hours',
    fee: 300,
    prizePool: '₹50,000',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '5',
    name: 'Event Name',
    category: 'gaming',
    day: 2,
    teamSize: '5 members',
    duration: '3 hours',
    fee: 500,
    prizePool: '₹25,000',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '6',
    name: 'Event Name',
    category: 'gaming',
    day: 2,
    teamSize: 'Solo',
    duration: '2 hours',
    fee: 100,
    prizePool: '₹10,000',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '7',
    name: 'Event Name',
    category: 'workshop',
    day: 3,
    teamSize: 'Solo',
    duration: '4 hours',
    fee: 250,
    prizePool: 'Certificate',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
  {
    id: '8',
    name: 'Event Name',
    category: 'workshop',
    day: 3,
    teamSize: 'Solo',
    duration: '3 hours',
    fee: 200,
    prizePool: 'Certificate',
    description: 'Event description goes here. Add details about the event, rules, and what participants can expect.',
  },
];

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTeamType, setSelectedTeamType] = useState('all');

  const filteredEvents = useMemo(() => {
    return placeholderEvents.filter((event) => {
      // Category filter
      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false;
      }
      
      // Day filter
      if (selectedDay !== null && event.day !== selectedDay) {
        return false;
      }
      
      // Team type filter
      if (selectedTeamType !== 'all') {
        const isSolo = event.teamSize.toLowerCase().includes('solo');
        if (selectedTeamType === 'solo' && !isSolo) return false;
        if (selectedTeamType === 'team' && isSolo) return false;
      }
      
      return true;
    });
  }, [selectedCategory, selectedDay, selectedTeamType]);

  const handleRegister = (eventId: string) => {
    // TODO: Implement registration flow
    console.log('Register for event:', eventId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-12">
            <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">
              Explore
            </span>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-foreground mb-4">
              <span className="text-primary text-glow">Events</span> & Competitions
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive into a world of creativity, innovation, and entertainment. 
              Find your calling in the depths of EUPHORIA.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters sidebar */}
            <aside className="lg:w-72 shrink-0">
              <div className="glass-card p-6 rounded-xl border border-border/50 sticky top-28">
                <h3 className="font-cinzel text-lg font-semibold text-foreground mb-6">
                  Filter Events
                </h3>
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

            {/* Events grid */}
            <div className="flex-1">
              {/* Results count */}
              <div className="mb-6 text-muted-foreground">
                Showing <span className="text-primary font-semibold">{filteredEvents.length}</span> events
              </div>

              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onRegister={handleRegister}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-2">No events found</p>
                  <p className="text-muted-foreground/60 text-sm">
                    Try adjusting your filters to discover more events
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
