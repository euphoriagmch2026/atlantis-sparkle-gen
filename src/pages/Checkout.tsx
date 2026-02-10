import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import {
  CheckoutForm,
  CheckoutFormData,
} from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { initiatePayment, isLoading } = useRazorpay();
  const { toast } = useToast();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/passes");
    }
  }, [cartItems.length, navigate]);

  const handleSubmit = async (
    data: CheckoutFormData & { teamMembers: string[] },
  ) => {
    const cartItemsForOrder = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      type: item.type,
    }));

    const result = await initiatePayment(cartItemsForOrder, {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      college: data.college,
      teamMembers: data.teamMembers,
    });

    if (result.success) {
      clearCart();
      navigate("/order-confirmation", {
        state: {
          orderId: result.razorpay_order_id,
          paymentId: result.razorpay_payment_id,
          userDetails: data,
        },
      });
    } else {
      toast({
        title: "Payment Failed",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />
      <main className="relative pt-24 md:pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <div className="text-center mb-10">
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground mb-3 text-glow">
              Checkout
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form stacks BELOW summary on mobile for better visibility */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="lg:sticky lg:top-28">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
