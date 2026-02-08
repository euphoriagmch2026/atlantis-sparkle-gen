import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { PassCard } from '@/components/passes/PassCard';
import { CartSummary } from '@/components/passes/CartSummary';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { PASSES } from '@/types/passes';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

const PassesContent = () => {
  const { totalItems } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-glow">
            Passes & Tickets
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your gateway to the lost city. Each pass unlocks a unique 
            journey through EUPHORIA 2026.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Pass Cards Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PASSES.map((pass) => (
                  <PassCard key={pass.id} pass={pass} />
                ))}
              </div>
            </div>

            {/* Desktop Cart Sidebar */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24">
                <CartSummary />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Cart Floating Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              size="lg"
              className={cn(
                'h-14 w-14 rounded-full shadow-lg',
                'bg-primary hover:bg-primary/90 text-primary-foreground',
                'animate-pulse-glow'
              )}
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-border/50">
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle className="font-cinzel text-foreground">Your Cart</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <CartSummary className="border-0 bg-transparent" />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Footer />
    </div>
  );
};

const Passes = () => {
  return (
    <CartProvider>
      <PassesContent />
    </CartProvider>
  );
};

export default Passes;
