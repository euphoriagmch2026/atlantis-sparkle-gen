import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

interface DaySchedule {
  day: string;
  date: string;
  theme: string;
  events: TimelineEvent[];
}

const schedule: DaySchedule[] = [
  {
    day: 'Day 1',
    date: 'March 15, 2026',
    theme: 'The Awakening',
    events: [
      { time: '10:00 AM', title: 'Opening Ceremony', description: 'Grand inauguration with special guests' },
      { time: '12:00 PM', title: 'Cultural Events Begin', description: 'Dance and music prelims' },
      { time: '03:00 PM', title: 'Tech Workshops', description: 'AI & ML masterclass' },
      { time: '07:00 PM', title: 'DJ Night', description: 'Electronic music extravaganza' },
    ],
  },
  {
    day: 'Day 2',
    date: 'March 16, 2026',
    theme: 'The Rising',
    events: [
      { time: '09:00 AM', title: 'Hackathon Kickoff', description: '24-hour coding challenge begins' },
      { time: '11:00 AM', title: 'Gaming Tournament', description: 'Esports elimination rounds' },
      { time: '02:00 PM', title: 'Cultural Finals', description: 'Dance and drama finals' },
      { time: '08:00 PM', title: 'Pro Show', description: 'Celebrity performance' },
    ],
  },
  {
    day: 'Day 3',
    date: 'March 17, 2026',
    theme: 'The Triumph',
    events: [
      { time: '10:00 AM', title: 'Hackathon Finals', description: 'Project presentations' },
      { time: '01:00 PM', title: 'Gaming Finals', description: 'Championship matches' },
      { time: '04:00 PM', title: 'Award Ceremony', description: 'Prize distribution' },
      { time: '07:00 PM', title: 'Closing Night', description: 'Grand finale celebration' },
    ],
  },
];

export const ScheduleSection = () => {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">
            Timeline
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4">
            Event <span className="text-primary text-glow">Schedule</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three days of non-stop excitement, innovation, and celebration.
          </p>
        </div>

        {/* Day tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {schedule.map((day, index) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(index)}
              className={cn(
                'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
                activeDay === index
                  ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <span className="block text-sm">{day.day}</span>
              <span className="block text-xs opacity-70">{day.date}</span>
            </button>
          ))}
        </div>

        {/* Active day theme */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 rounded-full border border-accent/30 text-accent text-sm">
            {schedule[activeDay].theme}
          </span>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

          {/* Events */}
          <div className="space-y-8">
            {schedule[activeDay].events.map((event, index) => (
              <div 
                key={event.title}
                className={cn(
                  'relative flex items-start gap-8',
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                )}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-primary animate-pulse-glow" />

                {/* Time */}
                <div className={cn(
                  'hidden md:block w-1/2 text-right',
                  index % 2 === 0 ? 'pr-12' : 'pl-12 text-left order-2'
                )}>
                  <span className="text-primary font-semibold">{event.time}</span>
                </div>

                {/* Content */}
                <div className={cn(
                  'ml-12 md:ml-0 md:w-1/2',
                  index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'
                )}>
                  <div className="glass-card rounded-lg p-4 border-glow hover:scale-105 transition-transform duration-300">
                    <span className="text-primary text-sm font-semibold md:hidden">{event.time}</span>
                    <h3 className="font-cinzel text-lg font-semibold text-foreground mt-1">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
