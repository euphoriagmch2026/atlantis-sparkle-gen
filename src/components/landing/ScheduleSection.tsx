import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, Trophy } from "lucide-react";

interface EventRow {
  id: string;
  name: string;
  category: string;
  day: number;
  description: string | null;
  fee: number;
  team_size: string;
  time: string | null;
}

const DAY_META: Record<number, { date: string; theme: string }> = {
  1: { date: "May 1, 2026", theme: "The Awakening" },
  2: { date: "May 2, 2026", theme: "The Rising" },
  3: { date: "May 3, 2026", theme: "The Triumph" },
  4: { date: "May 4, 2026", theme: "The Legacy" },
};

const CATEGORY_COLORS: Record<string, string> = {
  cultural: "bg-primary/20 text-primary border-primary/30",
  sports: "bg-accent/20 text-accent border-accent/30",
  workshop:
    "bg-[hsl(270,60%,50%)]/20 text-[hsl(270,60%,70%)] border-[hsl(270,60%,50%)]/30",
  literary:
    "bg-[hsl(16,85%,60%)]/20 text-[hsl(16,85%,70%)] border-[hsl(16,85%,60%)]/30",
};

/** Parse start time from strings like "10:00 AM - 11:30 AM" into minutes for sorting */
function parseTimeMinutes(time: string | null): number {
  if (!time) return Infinity;
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return Infinity;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function sortByTime(events: EventRow[]): EventRow[] {
  return [...events].sort(
    (a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time),
  );
}

type ActiveTab = number | "sports"; // number = index into days array

export const ScheduleSection = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(0);
  const [eventsByDay, setEventsByDay] = useState<Record<number, EventRow[]>>(
    {},
  );
  const [allEvents, setAllEvents] = useState<EventRow[]>([]);
  const [days, setDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, category, day, description, fee, team_size, time")
        .order("day")
        .order("name");
      if (!error && data) {
        setAllEvents(data as EventRow[]);
        const grouped: Record<number, EventRow[]> = {};
        for (const ev of data as EventRow[]) {
          if (!grouped[ev.day]) grouped[ev.day] = [];
          grouped[ev.day].push(ev);
        }
        const sortedDays = Object.keys(grouped)
          .map(Number)
          .sort((a, b) => a - b);
        setEventsByDay(grouped);
        setDays(sortedDays);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section className="relative py-24 px-4">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  if (days.length === 0) {
    return (
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4">
            Event <span className="text-primary text-glow">Schedule</span>
          </h2>
          <p className="text-muted-foreground">
            Schedule coming soon. Stay tuned!
          </p>
        </div>
      </section>
    );
  }

  const isSports = activeTab === "sports";
  const currentDay = !isSports ? days[activeTab as number] || days[0] : null;
  const meta = currentDay
    ? DAY_META[currentDay] || { date: `Day ${currentDay}`, theme: "" }
    : null;

  // Build display events
  let displayEvents: EventRow[];
  if (isSports) {
    // All sports events across all days, sorted by day then time
    displayEvents = sortByTime(
      allEvents.filter((e) => e.category === "sports"),
    ).sort(
      (a, b) =>
        a.day - b.day || parseTimeMinutes(a.time) - parseTimeMinutes(b.time),
    );
  } else {
    // Day events excluding sports
    const dayEvents = eventsByDay[currentDay!] || [];
    displayEvents = sortByTime(
      dayEvents.filter((e) => e.category !== "sports"),
    );
  }

  return (
    <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-secondary/20 to-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent text-sm tracking-[0.3em] uppercase mb-4 block">
            Timeline
          </span>
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-4">
            Event <span className="text-primary text-glow">Schedule</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {days.length} days of non-stop excitement, innovation, and
            celebration.
          </p>
        </div>

        {/* Day tabs + Sports tab */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {days.map((day, index) => {
            const dayMeta = DAY_META[day] || { date: "", theme: "" };
            return (
              <button
                key={day}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold transition-all duration-300",
                  activeTab === index
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="block text-sm">Day {day}</span>
                <span className="block text-xs opacity-70">{dayMeta.date}</span>
              </button>
            );
          })}
          <button
            onClick={() => setActiveTab("sports")}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex flex-col items-center gap-1",
              isSports
                ? "bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.4)]"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Trophy className="w-4 h-4" />
            <span className="block text-sm">Sports</span>
          </button>
        </div>

        {/* Active day theme */}
        {!isSports && meta?.theme && (
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 rounded-full border border-accent/30 text-accent text-sm">
              {meta.theme}
            </span>
          </div>
        )}

        {isSports && (
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 rounded-full border border-accent/30 text-accent text-sm">
              All Sports Events
            </span>
          </div>
        )}

        {/* Events grid */}
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
          <div className="space-y-8">
            {displayEvents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No events found.
              </p>
            )}
            {displayEvents.map((event, index) => {
              const colorClass =
                CATEGORY_COLORS[event.category] ||
                "bg-secondary/50 text-muted-foreground border-border/50";
              return (
                <div
                  key={event.id}
                  className={cn(
                    "relative flex items-start gap-8",
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
                  )}
                >
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-primary animate-pulse-glow" />
                  <div
                    className={cn(
                      "hidden md:block w-1/2",
                      index % 2 === 0
                        ? "pr-12 text-right"
                        : "pl-12 text-left order-2",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs border",
                        colorClass,
                      )}
                    >
                      {event.category}
                    </span>
                    {isSports && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        Day {event.day}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "ml-12 md:ml-0 md:w-1/2",
                      index % 2 === 0 ? "md:pl-12" : "md:pr-12",
                    )}
                  >
                    <div className="glass-card rounded-lg p-4 border-glow hover:scale-105 transition-transform duration-300">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-xs border mb-2 md:hidden",
                          colorClass,
                        )}
                      >
                        {event.category}
                      </span>
                      {event.time && (
                        <div className="flex items-center gap-1 text-xs text-accent mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      <h3 className="font-cinzel text-lg font-semibold text-foreground">
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className="text-muted-foreground text-sm mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Team: {event.team_size}</span>
                        {event.fee > 0 && <span>₹{event.fee}</span>}
                        {isSports && <span>Day {event.day}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
