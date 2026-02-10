import { Ticket, Calendar, Shield, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { PassTier } from "@/types/passes";

interface OrderSummaryProps {
  className?: string;
}

const passTierColors: Record<PassTier, string> = {
  basic: "text-primary",
  earlybird: "text-accent",
};

const eventCategoryColors: Record<string, string> = {
  cultural: "text-primary",
  gaming: "text-coral",
  workshop: "text-mystic",
};

export const OrderSummary = ({ className }: OrderSummaryProps) => {
  const { cartItems, totalAmount, passItems, eventItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <div
        className={cn(
          "glass-card rounded-xl p-6 border border-border/50",
          className,
        )}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-cinzel text-lg text-foreground mb-2">
            No items to checkout
          </h3>
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
        </div>
      </div>
    );
  }

  const passSubtotal = passItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const eventSubtotal = eventItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div
      className={cn(
        "glass-card rounded-xl border border-border/50 overflow-hidden",
        className,
      )}
    >
      <div className="p-4 border-b border-border/50 bg-secondary/20">
        <h3 className="font-cinzel text-lg text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Order Summary
        </h3>
      </div>

      <div className="p-4 space-y-4 max-h-[350px] md:max-h-[500px] overflow-y-auto">
        {passItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Passes
              </span>
            </div>
            <div className="space-y-2">
              {passItems.map((item) => (
                <div
                  key={`pass-${item.id}`}
                  className="flex items-start justify-between py-2 border-b border-border/20 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4
                      className={cn(
                        "font-medium text-sm truncate",
                        passTierColors[item.tier],
                      )}
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Passes Subtotal</span>
              <span className="text-foreground">₹{passSubtotal}</span>
            </div>
          </div>
        )}

        {eventItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Events
              </span>
            </div>
            <div className="space-y-2">
              {eventItems.map((item) => (
                <div
                  key={`event-${item.id}`}
                  className="flex items-start justify-between py-2 border-b border-border/20 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4
                      className={cn(
                        "font-medium text-sm truncate",
                        eventCategoryColors[item.category] || "text-foreground",
                      )}
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Day {item.day} • {item.teamSize} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Events Subtotal</span>
              <span className="text-foreground">₹{eventSubtotal}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base md:text-lg font-medium text-foreground">
            Grand Total
          </span>
          <span className="text-xl md:text-2xl font-bold text-glow-gold text-accent">
            ₹{totalAmount}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-secondary/40 rounded-lg">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-[10px] md:text-xs text-muted-foreground">
            Secured by Razorpay
          </span>
        </div>
      </div>
    </div>
  );
};
