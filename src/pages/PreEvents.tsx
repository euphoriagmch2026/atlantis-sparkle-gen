import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define the shape of our data based on the Supabase table
type PreEvent = {
  id: string;
  name: string;
  description: string;
  category: "pre-euphoria" | "offstage";
  form_link?: string;
  wa_link?: string;
};

// The EventCard automatically handles showing the correct button based on the links provided
const EventCard = ({ event }: { event: PreEvent }) => (
  <div className="glass-card rounded-xl border border-border/50 p-6 flex flex-col h-full">
    <h3 className="font-cinzel text-xl font-bold text-foreground mb-2">
      {event.name}
    </h3>
    <p className="text-muted-foreground text-sm flex-grow mb-6">
      {event.description}
    </p>

    <div className="flex flex-col gap-3 mt-auto">
      {event.form_link && (
        <Button asChild variant="default" className="w-full gap-2">
          <a href={event.form_link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" /> Register via Form
          </a>
        </Button>
      )}

      {event.wa_link && (
        <Button
          asChild
          variant="outline"
          className="w-full gap-2 border-green-500/50 text-green-500 hover:bg-green-500/10"
        >
          <a href={event.wa_link} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4" /> Join WhatsApp Group
          </a>
        </Button>
      )}
    </div>
  </div>
);

const PreEvents = () => {
  const [events, setEvents] = useState<PreEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("pre_events")
        .select("*")
        .order("created_at", { ascending: true }); // Keeps events in the order you added them

      if (error) {
        console.error("Error fetching pre-events:", error);
      } else if (data) {
        setEvents(data as PreEvent[]);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // Separate the fetched events into their two respective categories
  const preEuphoriaEvents = events.filter((e) => e.category === "pre-euphoria");
  const offstageEvents = events.filter((e) => e.category === "offstage");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />

      <main className="relative pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-foreground mb-4 text-glow">
              Pre-Euphoria & Offstage Events
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join the hype before the main fest begins! Register for
              Pre-Euphoria events via Google Forms, or join the WhatsApp groups
              for Offstage event updates.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Pre-Euphoria Section */}
              {preEuphoriaEvents.length > 0 && (
                <div className="mb-16">
                  <h2 className="font-cinzel text-2xl font-bold text-primary mb-6 border-b border-border/50 pb-2">
                    Pre-Euphoria Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {preEuphoriaEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Offstage Events Section */}
              {offstageEvents.length > 0 && (
                <div>
                  <h2 className="font-cinzel text-2xl font-bold text-accent mb-6 border-b border-border/50 pb-2">
                    Offstage Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offstageEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State Fallback */}
              {events.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-xl border border-border/50">
                  <p>Events are being finalized. Check back soon!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PreEvents;
