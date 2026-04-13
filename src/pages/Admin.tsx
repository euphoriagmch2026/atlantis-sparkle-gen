import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Ticket, Users } from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "Rtx@2026ti#") {
      setIsAuthenticated(true);
      fetchPaidOrders();
    } else toast({ title: "Access Denied", variant: "destructive" });
  };

  const fetchPaidOrders = async () => {
    setIsLoading(true);
    // Fetch ONLY PAID orders and include relational order_items
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching orders", description: error.message, variant: "destructive" });
    } else if (data) {
      setOrders(data);
    }
    setIsLoading(false);
  };

  if (!isAuthenticated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Helmet>
          <title>Admin Login | EUPHORIA 2026</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <form onSubmit={handleLogin} className="glass-card p-8 rounded-xl w-full max-w-sm">
          <h1 className="font-cinzel text-2xl font-bold mb-6 text-center text-glow">Admin Portal</h1>
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter Passcode"
            className="mb-4 bg-secondary/30 border-border/50"
          />
          <Button className="w-full bg-primary hover:bg-primary/90">Login</Button>
        </form>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pt-32 px-4 max-w-7xl mx-auto pb-20">
      <Helmet>
        <title>Admin Dashboard | EUPHORIA 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="font-cinzel text-3xl font-bold text-glow">Paid Registrations</h1>
        <div className="flex gap-4">
          <Button onClick={fetchPaidOrders} variant="outline" disabled={isLoading} className="border-primary/50 text-primary">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Refresh Data"}
          </Button>
          <Badge variant="outline" className="text-sm py-1.5 px-4 bg-green-500/10 text-green-400 border-green-500/30">
            Total Paid Orders: {orders.length}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => {
          // SCRAPER LOGIC: Aggressively hunt for items across new relational tables AND legacy JSON blobs
          const allItems = (order.order_items && order.order_items.length > 0) 
            ? order.order_items 
            : (order.metadata?.cartItems || order.checkout_data?.cartItems || order.cartItems || []);

          // Count Basic Registrations robustly
          const basicRegCount = allItems.reduce((total: number, item: any) => {
            const type = (item.item_type || item.type || "").toLowerCase();
            const name = (item.item_name || item.name || item.title || "").toLowerCase();

            if (type === 'pass' || name.includes("basic") || name.includes("registration") || name.includes("pass") || name.includes("earlybird")) {
              return total + (Number(item.quantity) || 1);
            }
            return total;
          }, 0);

          // Filter for Events strictly
          const purchasedEvents = allItems.filter((item: any) => {
            const type = (item.item_type || item.type || "").toLowerCase();
            const name = (item.item_name || item.name || item.title || "").toLowerCase();

            if (type === 'event') return true;
            // Legacy fallback: if there is no explicit type, classify it as an event ONLY if it isn't a pass
            if (!type && name && !name.includes("basic") && !name.includes("registration") && !name.includes("pass") && !name.includes("earlybird")) {
              return true;
            }
            return false;
          });

          return (
            <div
              key={order.id}
              className="glass-card p-6 rounded-xl border border-primary/20 flex flex-col h-full hover:border-primary/50 transition-colors"
            >
              {/* Header: Name & Status */}
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-lg leading-tight text-foreground">
                  {order.full_name}
                </h3>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                  Paid
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                <p>{order.email}</p>
                <p className="truncate" title={order.college}>{order.college}</p>
                {order.phone && <p>{order.phone}</p>}
              </div>

              {/* Basic Registrations Highlight Badge */}
              <div className="flex justify-between items-center mb-4 bg-primary/10 p-3 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-foreground">Basic Registrations</span>
                </div>
                <span className="text-primary text-xl font-bold bg-background/50 px-3 py-1 rounded-md">{basicRegCount}</span>
              </div>

              {/* Order Items (Events) */}
              {/* Order Items (Events) */}
              <div className="mb-4 flex-grow space-y-2 border-y border-border/30 py-4">
                <p className="text-sm font-semibold text-foreground mb-2">Events Purchased:</p>
                {purchasedEvents.length > 0 ? (
                  purchasedEvents.map((item: any, idx: number) => {
                    const itemName = item.item_name || item.name || item.title || "Unnamed Event";
                    const itemQty = Number(item.quantity) || 1;
                    
                    // STRICTLY handle paise to rupee conversion (Database standard)
                    // If your DB has 50000, this makes it ₹500
                    // We multiply by quantity just in case they bought multiple of the same event
                    const rawPrice = Number(item.price) || 0;
                    const displayPrice = ((rawPrice * itemQty) / 100).toFixed(0);

                    return (
                      <div key={item.id || idx} className="flex justify-between text-sm items-center gap-2">
                        <span className="text-muted-foreground leading-tight">
                          • {itemName} {itemQty > 1 && <span className="text-primary font-bold">(x{itemQty})</span>}
                        </span>
                        <span className="text-foreground shrink-0 font-mono">₹{displayPrice}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic">No events found.</p>
                )}
              </div>

              {/* Team Members Section */}
              {(() => {
                const team =
                  order.team_members ||
                  order.checkout_data?.teamMembers ||
                  order.metadata?.teamMembers;

                if (Array.isArray(team) && team.length > 0) {
                  return (
                    <div className="mb-4 p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" /> Team Members
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {team.map((tm: string, idx: number) => (
                          <li key={idx} className="capitalize">{tm}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Pricing & Payment ID */}
              <div className="mt-auto pt-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Paid</span>
                  <span className="text-accent text-2xl font-bold text-glow-gold">
                    ₹{order.total_amount / 100}
                  </span>
                </div>

                {order.razorpay_payment_id && (
                  <div className="bg-secondary/50 p-2.5 rounded-lg font-mono text-xs text-center break-all text-muted-foreground border border-border/30">
                    <span className="opacity-50">TXN:</span> {order.razorpay_payment_id.replace("UTR_", "")}
                  </div>
                )}
                <div className="text-center mt-3 text-[10px] text-muted-foreground/50">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && orders.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-secondary/10">
            <Ticket className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No paid orders found in the database yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}