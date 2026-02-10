import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CartSummary } from "@/components/passes/CartSummary";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto w-full">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h1 className="font-cinzel text-3xl font-bold text-foreground text-glow">
              Your Selection ({totalItems})
            </h1>
          </div>

          {/* Direct render prevents drawer scroll-lock bugs */}
          <CartSummary className="border-border/50 bg-secondary/10 shadow-2xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
