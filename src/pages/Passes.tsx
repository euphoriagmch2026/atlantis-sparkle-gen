import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { PassCard } from "@/components/passes/PassCard";
import { CartSummary } from "@/components/passes/CartSummary";
import { useCart } from "@/contexts/CartContext";
import { PASSES } from "@/types/passes";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Passes = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />

      <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-cinzel text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-glow">
            Passes & Tickets
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Choose your gateway to the lost city. Each pass unlocks a unique
            journey through EUPHORIA 2026.
          </p>
        </div>
      </section>

      <section className="relative pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {PASSES.map((pass) => (
                  <PassCard key={pass.id} pass={pass} />
                ))}
              </div>
            </div>

            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24">
                <CartSummary />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIXED: No Drawer on mobile. Standard navigation prevents body lock */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <Button
          size="lg"
          onClick={() => navigate("/cart")}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "animate-pulse-glow relative",
          )}
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center border-2 border-background">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Passes;
