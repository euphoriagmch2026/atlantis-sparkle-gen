import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Minus, Plus, ShoppingCart, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pass, PassTier } from '@/types/passes';
import { useCart } from '@/contexts/CartContext';

interface PassCardProps {
  pass: Pass;
}

const tierStyles: Record<PassTier, { border: string; glow: string; badge: string }> = {
  basic: {
    border: 'border-primary/50',
    glow: 'hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)]',
    badge: 'border-primary/50 text-primary',
  },
  earlybird: {
    border: 'border-accent/50',
    glow: 'hover:shadow-[0_0_40px_hsl(var(--accent)/0.3)]',
    badge: 'border-accent/50 text-accent',
  },
};

const tierLabels: Record<PassTier, string> = {
  basic: 'Essential',
  earlybird: 'Best Value',
};

export const PassCard = ({ pass }: PassCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addPassToCart, isInCart } = useCart();
  const styles = tierStyles[pass.tier];
  const inCart = isInCart(pass.id, 'pass');

  const handleAddToCart = () => {
    addPassToCart(pass, quantity);
    setQuantity(1);
  };

  return (
    <Card
      className={cn(
        'group glass-card overflow-hidden transition-all duration-500',
        'hover:scale-[1.02]',
        styles.border,
        styles.glow
      )}
    >
      {/* Header with tier badge */}
      <div className="relative p-6 pb-4">
        <div
          className={cn(
            'absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase',
            'bg-background/80 backdrop-blur-sm border',
            styles.badge
          )}
        >
          {tierLabels[pass.tier]}
        </div>

        <h3 className="font-cinzel text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {pass.name}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 min-h-[3rem]">
          {pass.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold text-glow-gold text-accent">
            ₹{pass.price}
          </span>
          <span className="text-muted-foreground text-sm">/pass</span>
        </div>
      </div>

      <CardContent className="p-6 pt-0">
        {/* Benefits */}
        <div className="space-y-2 mb-6">
          {pass.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/50"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium text-foreground">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border/50"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add to cart button */}
        <Button
          className={cn(
            "w-full gap-2",
            inCart 
              ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          onClick={handleAddToCart}
        >
          {inCart ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Add More
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
