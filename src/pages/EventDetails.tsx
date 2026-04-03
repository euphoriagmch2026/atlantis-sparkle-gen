import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Event } from "@/components/events/EventCard";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  Clock,
  Trophy,
  IndianRupee,
  ShoppingCart,
  CheckCircle,
  ScrollText,
} from "lucide-react";

const categoryColors = {
  cultural: "primary",
  gaming: "coral",
  workshop: "mystic",
} as const;

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { addEventToCart, isInCart } = useCart();
  const [event, setEvent] = useState<(Event & { rules?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (!error && data) {
        setEvent({
          id: data.id,
          name: data.name,
          category: data.category as Event["category"],
          day: data.day as Event["day"],
          teamSize: data.team_size,
          duration: data.duration || "",
          fee: data.fee,
          prizePool: data.prize_pool || "TBA",
          description: data.description || "",
          posterUrl: data.poster_url || undefined,
          rules: (data as any).rules || undefined,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-cinzel text-2xl text-foreground mb-4">Event Not Found</h1>
            <Button variant="outline" onClick={() => navigate("/events")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const colorKey = categoryColors[event.category];
  const inCart = isInCart(event.id, "event");

  const rulesLines = event.rules
    ? event.rules.split("\n").filter((l) => l.trim())
    : [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />

      <main className="relative pt-24 md:pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <Button
            variant="ghost"
            onClick={() => navigate("/events")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>

          <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
            {/* Hero */}
            <div className="relative h-56 md:h-72 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
              {event.posterUrl ? (
                <img
                  src={event.posterUrl}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-cinzel text-5xl text-muted-foreground/30">
                    {event.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm border border-border/50 text-foreground">
                  Day {event.day}
                </span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase bg-background/80 backdrop-blur-sm border",
                    colorKey === "primary" && "border-primary/50 text-primary",
                    colorKey === "coral" && "border-coral/50 text-coral",
                    colorKey === "mystic" && "border-mystic/50 text-mystic"
                  )}
                >
                  {event.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-foreground mb-4 text-glow">
                {event.name}
              </h1>

              {/* Meta grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground/70">Team Size</p>
                    <p className="text-sm font-medium text-foreground">{event.teamSize}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground/70">Duration</p>
                    <p className="text-sm font-medium text-foreground">{event.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="w-5 h-5 text-coral" />
                  <div>
                    <p className="text-xs text-muted-foreground/70">Entry Fee</p>
                    <p className="text-sm font-medium text-foreground">₹{event.fee}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="w-5 h-5 text-mystic" />
                  <div>
                    <p className="text-xs text-muted-foreground/70">Prize Pool</p>
                    <p className="text-sm font-medium text-foreground">{event.prizePool}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-8">
                  <h2 className="font-cinzel text-lg font-semibold text-foreground mb-3">
                    About This Event
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Rules */}
              {rulesLines.length > 0 && (
                <div className="mb-8 p-5 rounded-lg bg-secondary/20 border border-border/30">
                  <h2 className="font-cinzel text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-primary" />
                    Rules & Guidelines
                  </h2>
                  <ul className="space-y-2">
                    {rulesLines.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add to Cart */}
              <Button
                size="lg"
                className={cn(
                  "w-full md:w-auto gap-2 px-8",
                  inCart
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
                onClick={() => addEventToCart(event)}
              >
                {inCart ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Add to Cart — ₹{event.fee}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
