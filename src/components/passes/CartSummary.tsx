import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  Ticket,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { PassTier } from "@/types/passes";

interface CartSummaryProps {
  className?: string;
  onCheckoutClick?: () => void;
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

export const CartSummary = ({
  className,
  onCheckoutClick,
}: CartSummaryProps) => {
  const navigate = useNavigate();
  const {
    cartItems,
    totalAmount,
    totalItems,
    passItems,
    eventItems,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const handleCheckout = () => {
    if (onCheckoutClick) onCheckoutClick();
    navigate("/checkout");
  };

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
            Your treasure chest is empty
          </h3>
          <p className="text-sm text-muted-foreground">
            Add some passes or events to begin your journey
          </p>
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
          Your Selection
          <span className="ml-auto text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </h3>
      </div>

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {passItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Passes
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ₹{passSubtotal}
              </span>
            </div>
            <div className="space-y-2">
              {passItems.map((item) => (
                <div
                  key={`pass-${item.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-medium text-sm truncate",
                        passTierColors[item.tier],
                      )}
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateQuantity(item.id, "pass", item.quantity - 1)
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateQuantity(item.id, "pass", item.quantity + 1)
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium text-foreground">
                      ₹{item.price * item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id, "pass")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
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
              <span className="text-xs text-muted-foreground ml-auto">
                ₹{eventSubtotal}
              </span>
            </div>
            <div className="space-y-2">
              {eventItems.map((item) => (
                <div
                  key={`event-${item.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-medium text-sm truncate",
                        eventCategoryColors[item.category],
                      )}
                    >
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Day {item.day} • {item.teamSize} • ₹{item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateQuantity(item.id, "event", item.quantity - 1)
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateQuantity(item.id, "event", item.quantity + 1)
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium text-foreground">
                      ₹{item.price * item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id, "event")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Grand Total</span>
          <span className="text-2xl font-bold text-glow-gold text-accent">
            ₹{totalAmount}
          </span>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};
