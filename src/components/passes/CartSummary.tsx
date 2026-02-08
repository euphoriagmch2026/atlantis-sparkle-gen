import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { PassTier } from '@/types/passes';

interface CartSummaryProps {
  className?: string;
  onCheckout?: () => void;
}

const tierColors: Record<PassTier, string> = {
  general: 'text-primary',
  day: 'text-mystic',
  proshow: 'text-coral',
  vip: 'text-accent',
};

export const CartSummary = ({ className, onCheckout }: CartSummaryProps) => {
  const { cartItems, totalAmount, totalItems, removeFromCart, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className={cn('glass-card rounded-xl p-6 border border-border/50', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-cinzel text-lg text-foreground mb-2">
            Your treasure chest is empty
          </h3>
          <p className="text-sm text-muted-foreground">
            Add some passes to begin your journey
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass-card rounded-xl border border-border/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-secondary/20">
        <h3 className="font-cinzel text-lg text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Your Selection
          <span className="ml-auto text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </h3>
      </div>

      {/* Cart items */}
      <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
        {cartItems.map((item) => (
          <div
            key={item.passId}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
          >
            <div className="flex-1 min-w-0">
              <h4 className={cn('font-medium text-sm truncate', tierColors[item.tier])}>
                {item.passName}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{item.price} × {item.quantity}
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => updateQuantity(item.passId, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => updateQuantity(item.passId, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {/* Item total and remove */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-foreground">
                ₹{item.price * item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={() => removeFromCart(item.passId)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with total and checkout */}
      <div className="p-4 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Grand Total</span>
          <span className="text-2xl font-bold text-glow-gold text-accent">
            ₹{totalAmount}
          </span>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};
