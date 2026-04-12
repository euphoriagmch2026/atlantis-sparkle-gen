import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Clock, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import {
  CheckoutForm,
  CheckoutFormData,
} from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // QR & Order States
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeUserData, setActiveUserData] = useState<any>(null);

  // NEW: Timer States (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (cartItems.length === 0 && !qrImageUrl) navigate("/events");
  }, [cartItems, navigate, qrImageUrl]);

  // NEW: The 10-Minute Countdown Timer Logic
  useEffect(() => {
    if (!qrImageUrl || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true); // Kill the session

          // Optionally: Silently mark the order as failed in the database
          if (activeOrderId) {
            supabase
              .from("orders")
              .update({ status: "failed" })
              .eq("id", activeOrderId)
              .then();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrImageUrl, isExpired, activeOrderId]);

  // SUPABASE REALTIME LISTENER
  useEffect(() => {
    // If we don't have an order, OR if the timer expired, stop listening!
    if (!activeOrderId || isExpired) return;

    const channel = supabase
      .channel("custom-payment-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${activeOrderId}`,
        },
        (payload) => {
          if (payload.new.status === "paid") {
            clearCart();
            navigate("/order-confirmation", {
              state: {
                orderId: activeOrderId,
                paymentId: payload.new.razorpay_payment_id || "Auto-Verified",
                userDetails: activeUserData,
              },
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrderId, isExpired, navigate, clearCart, activeUserData]);

  const handleSubmit = async (
    data: CheckoutFormData & { teamMembers: string[] },
  ) => {
    setIsProcessing(true);
    setActiveUserData(data);

    // Reset timer states in case this is a retry
    setIsExpired(false);
    setTimeLeft(600);

    try {
      const { data: responseData, error } = await supabase.functions.invoke(
        "generate-qr",
        {
          body: { checkoutData: data, cartItems, totalAmount },
        },
      );

      if (error || responseData.error)
        throw new Error(error?.message || responseData.error);

      setQrImageUrl(responseData.qrUrl);
      setActiveOrderId(responseData.orderId);
    } catch (error: any) {
      toast({
        title: "Failed to load payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <Navbar />
      <main className="relative pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {qrImageUrl ? (
          // QR CODE DISPLAY SCREEN
          <div className="glass-card max-w-md mx-auto p-8 rounded-xl text-center border-primary/50 relative overflow-hidden">
            {/* NEW: Expiry Overlay */}
            {isExpired ? (
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6">
                <AlertCircle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="font-cinzel text-2xl font-bold text-foreground mb-2">
                  Session Expired
                </h2>
                <p className="text-muted-foreground mb-8 text-sm">
                  For security reasons, this payment QR code has expired.
                </p>
                <Button
                  onClick={() => {
                    setQrImageUrl(null);
                    setActiveOrderId(null);
                  }}
                  className="w-full bg-primary text-primary-foreground"
                >
                  Create New Order
                </Button>
              </div>
            ) : null}

            <h2 className="font-cinzel text-2xl text-primary font-bold mb-2">
              Scan to Pay
            </h2>
            <p className="text-muted-foreground mb-6">
              Open GPay, PhonePe, or Paytm.
            </p>

            <div
              className={`bg-white p-4 rounded-xl inline-block border-4 mb-6 transition-all duration-300 ${timeLeft < 60 ? "border-destructive animate-pulse" : "border-primary/20"}`}
            >
              <img
                src={qrImageUrl}
                alt="UPI QR Code"
                className="w-64 h-auto object-contain opacity-100"
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
              {/* NEW: The Live Timer */}
              <div
                className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg border ${timeLeft < 60 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-secondary/50 text-foreground border-border/50"}`}
              >
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>

              <div className="flex items-center justify-center gap-2 text-accent text-sm">
                <Loader2 className="animate-spin w-4 h-4" />
                <p className="font-semibold animate-pulse">
                  Awaiting confirmation...
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Do not refresh this page. It will automatically redirect when
              payment is received.
            </p>
          </div>
        ) : (
          // NORMAL CHECKOUT FORM
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <CheckoutForm
                onSubmit={handleSubmit}
                isLoading={isProcessing}
                totalAmount={totalAmount}
              />
            </div>
            <div className="lg:col-span-2">
              <OrderSummary />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
